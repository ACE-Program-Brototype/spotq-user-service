import type { IAdminTokenService } from "@application/ports/services/index.ts";
import type { IAdminVerifyEmailForgotPasswordUseCase } from "@application/ports/use-cases/admin/auth/IVerify.email.forgot-password";
import { TYPES } from "@config/di/types.ts";
import { UserNotFoundError } from "@domain/errors/user.not-found.error";
import type { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";
import type { IOtpService } from "@domain/repository/shared/IOtp.service";
import { inject, injectable } from "inversify";

@injectable()
export class VerifyForgotPasswordEmailUseCase
	implements IAdminVerifyEmailForgotPasswordUseCase
{
	constructor(
		@inject(TYPES.AdminAuthRepository)
		private readonly _adminAuthRepository: IAdminAuthRepository,
		@inject(TYPES.AdminOtpService)
		private readonly _otpService: IOtpService,
		@inject(TYPES.AdminTokenService)
		private readonly _tokenService: IAdminTokenService,
	) {}

	public async execute(email: string, otp: string): Promise<string> {
		const user = await this._adminAuthRepository.findByEmail(email);

		if (!user) {
			throw new UserNotFoundError();
		}

		await this._otpService.verifyOtp(email, otp);

		const tempToken = this._tokenService.generateTempToken({
			userId: user.id,
			role: "admin",
		});

		return tempToken;
	}
}
