import type { ITokenService } from "@application/ports/service/IToken.service";
import { IAdminVerifyEmailForgotPasswordUseCase } from "@application/ports/use-cases/admin/auth/IVerify.email.forgot-password";
import { TYPES } from "@config/di/types.ts";
import type { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";
import type { IOtpService } from "@domain/repository/shared/IOtp.service";
import { HttpStatus } from "@shared/constants";
import { authConstants } from "@shared/constants/auth.constants";
import { AppError } from "@shared/util/app.error";
import { inject, injectable } from "inversify";

@injectable()
export class VerifyForgotPasswordEmailUseCase
	implements IAdminVerifyEmailForgotPasswordUseCase
{
	constructor(
		@inject(TYPES.AdminAuthRepository)
		private readonly _adminAuthRepository: IAdminAuthRepository,
		@inject(TYPES.OtpService)
		private readonly _otpService: IOtpService,
		@inject(TYPES.TokenService)
		private readonly _tokenService: ITokenService
	) {}

	public async execute(email: string, otp: string): Promise<string> {
		const user = await this._adminAuthRepository.findByEmail(email);

		if (!user) {
			throw new AppError(authConstants.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
		}

		await this._otpService.verifyOtp(email, otp);

		const tempToken = this._tokenService.generateTempToken({ userId: user.id, role: "admin" });

		return tempToken;
	}
}
