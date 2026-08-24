import type {
	ILogger,
	IOtpService,
} from "@application/ports/services/index.ts";
import { TYPES } from "@config/di/types.ts";
import { InvalidOtpError } from "@domain/errors/domain.error.ts";
import { Email } from "@domain/value-objects/email.vo.ts";
import type { IVerifyEmailOtpUseCase } from "@ports/use-cases/index.ts";
import { REGEX, ResponseMessage } from "@shared/constants/index.ts";
import { inject, injectable } from "inversify";
import type {
	VerifyEmailOtpDto,
	VerifyEmailOtpResultDto,
} from "../dtos/verify-email-otp.dto.ts";

@injectable()
export class VerifyEmailOtpUseCase implements IVerifyEmailOtpUseCase {
	constructor(
		@inject(TYPES.OtpService)
		private readonly otpService: IOtpService,
		@inject(TYPES.Logger)
		private readonly logger: ILogger,
	) {}

	public async execute(
		dto: VerifyEmailOtpDto,
	): Promise<VerifyEmailOtpResultDto> {
		const email = Email.create(dto.email);

		if (!dto.otp || !REGEX.OTP.test(dto.otp.trim())) {
			throw new InvalidOtpError("OTP must be exactly 6 digits.");
		}

		await this.otpService.verifyOtp(email.getValue(), dto.otp.trim());

		this.logger.info(
			{
				email: email.getValue(),
				event: "EMAIL_OTP_VERIFICATION_SUCCESS",
			},
			"Email OTP verified successfully",
		);

		return {
			success: true,
			message: ResponseMessage.EMAIL_VERIFIED,
		};
	}
}
