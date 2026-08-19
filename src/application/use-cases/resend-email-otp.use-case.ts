import type {
	IEmailQueueProducer,
	ILogger,
	IOtpService,
} from "@application/ports/services/index.ts";
import { TYPES } from "@config/di/types.ts";
import { UserNotFoundError } from "@domain/errors/domain.error.ts";
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
		private readonly _userRepository: IUserRepository,
		@inject(TYPES.OtpService)
		private readonly _otpService: IOtpService,
		@inject(TYPES.EmailQueueProducer)
		private readonly _emailQueueProducer: IEmailQueueProducer,
		@inject(TYPES.Logger)
		private readonly _logger: ILogger,
	) {}

	public async execute(
		dto: ResendEmailOtpDto,
	): Promise<ResendEmailOtpResultDto> {
		const email = Email.create(dto.email);

		const user = await this._userRepository.findByEmail(email);
		if (!user) {
			throw new UserNotFoundError("No account found with this email address.");
		}

		// Generate new OTP (this resets attempt count and invalidates previous OTP)
		const otp = await this._otpService.generateAndStoreOtp(email.getValue());

		// Queue email delivery job in BullMQ
		await this._emailQueueProducer.queueVerificationEmail({
			email: email.getValue(),
			otp,
		});

		this._logger.info(
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
