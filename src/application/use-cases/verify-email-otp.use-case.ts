import type { IOtpService } from "@application/ports/services/otp-service.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { InvalidOtpError } from "@domain/errors/domain.error.ts";
import { Email } from "@domain/value-objects/email.vo.ts";
import { logger } from "@infrastructure/logger/logger.ts";
import { OTP_CONSTANTS, ResponseMessage } from "@shared/constants/index.ts";
import { inject, injectable } from "inversify";
import type {
	VerifyEmailOtpDto,
	VerifyEmailOtpResultDto,
} from "../dtos/verify-email-otp.dto.ts";

@injectable()
export class VerifyEmailOtpUseCase {
	constructor(
		@inject(TYPES.OtpService)
		private readonly otpService: IOtpService,
	) {}

	public async execute(
		dto: VerifyEmailOtpDto,
	): Promise<VerifyEmailOtpResultDto> {
		const email = Email.create(dto.email);

		if (!dto.otp || !OTP_CONSTANTS.REGEX.test(dto.otp.trim())) {
			throw new InvalidOtpError("OTP must be exactly 6 digits.");
		}

		await this.otpService.verifyOtp(email.getValue(), dto.otp.trim());

		logger.info(
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
