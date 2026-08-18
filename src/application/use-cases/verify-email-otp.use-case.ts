import type { IOtpService, ILogger } from "@application/ports/services/index.ts";
import type { IVerifyEmailOtpUseCase } from "@ports/use-cases/index.ts";
import { TYPES } from "@config/di/types.ts";
import { InvalidOtpError } from "@domain/errors/domain.error.ts";
import { Email } from "@domain/value-objects/email.vo.ts";
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
		private readonly _otpService: IOtpService,
		@inject(TYPES.Logger)
		private readonly _logger: ILogger,
	) {}

	public async execute(
		dto: VerifyEmailOtpDto,
	): Promise<VerifyEmailOtpResultDto> {
		const email = Email.create(dto.email);

		if (!dto.otp || !REGEX.OTP.test(dto.otp.trim())) {
			throw new InvalidOtpError("OTP must be exactly 6 digits.");
		}

		await this._otpService.verifyOtp(email.getValue(), dto.otp.trim());

		this._logger.info(
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
