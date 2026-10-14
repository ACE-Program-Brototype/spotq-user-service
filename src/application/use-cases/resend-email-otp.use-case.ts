import type {
	IEmailQueueProducer,
	ILogger,
	IOtpService,
} from "@application/ports/services/index.ts";
import { TYPES } from "@config/di/types.ts";
import { UserStatus } from "@domain/entities/user.entity.ts";
import { UserBlockedError } from "@domain/errors/domain.error.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { Email } from "@domain/value-objects/email.vo.ts";
import type { IResendEmailOtpUseCase } from "@ports/use-cases/index.ts";
import { ResponseMessage } from "@shared/constants/index.ts";
import { inject, injectable } from "inversify";
import type {
	ResendEmailOtpDto,
	ResendEmailOtpResultDto,
} from "../dtos/resend-email-otp.dto.ts";

@injectable()
export class ResendEmailOtpUseCase implements IResendEmailOtpUseCase {
	constructor(
		@inject(TYPES.UserRepository)
		private readonly userRepository: IUserRepository,
		@inject(TYPES.OtpService)
		private readonly otpService: IOtpService,
		@inject(TYPES.EmailQueueProducer)
		private readonly emailQueueProducer: IEmailQueueProducer,
		@inject(TYPES.Logger)
		private readonly logger: ILogger,
	) {}

	public async execute(
		dto: ResendEmailOtpDto,
	): Promise<ResendEmailOtpResultDto> {
		const email = Email.create(dto.email);

		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			this.logger.warn(
				{ email: email.getValue(), event: "RESEND_OTP_USER_NOT_FOUND" },
				"Resend OTP requested for non-existent user",
			);
			return {
				success: true,
				message: ResponseMessage.OTP_RESENT,
			};
		}

		if (user.status === UserStatus.BLOCKED) {
			throw new UserBlockedError();
		}

		if (user.isEmailVerified) {
			this.logger.info(
				{
					email: email.getValue(),
					userId: user.id,
					event: "RESEND_OTP_ALREADY_VERIFIED",
				},
				"Resend OTP skipped because account email is already verified",
			);
			return {
				success: true,
				message: ResponseMessage.OTP_RESENT,
			};
		}

		// Generate new OTP (this resets attempt count and invalidates previous OTP)
		const otp = await this.otpService.generateAndStoreOtp(email.getValue());

		// Queue email delivery
		await this.emailQueueProducer.queueVerificationEmail({
			email: email.getValue(),
			otp,
		});

		this.logger.info(
			{
				email: email.getValue(),
				userId: user.id,
				event: "EMAIL_OTP_RESENT",
			},
			"Verification OTP resent successfully",
		);

		return {
			success: true,
			message: ResponseMessage.OTP_RESENT,
		};
	}
}
