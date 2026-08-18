import { TYPES } from "@config/di/types.ts";
import { logger } from "@infrastructure/logger/logger.ts";
import { inject, injectable } from "inversify";
import { IOtpService } from "@infrastructure/interface/shared/IOtp.service.ts";
import { IAdminAuthRepository } from "@infrastructure/interface/admin/IAdmin.auth.repo.ts";
import { AppError } from "@shared/util/app.error";
import { authConstants } from "@shared/constants/auth.constants";
import { HttpStatus } from "@shared/constants";
import { generateTempToken } from "@infrastructure/services/token";
import { IAdminVerifyEmailForgotPasswordUseCase } from "@application/interface/admin/auth/IVerify.email.forgot-password";

@injectable()
export class VerifyForgotPasswordEmailUseCase implements IAdminVerifyEmailForgotPasswordUseCase{
	constructor(
        @inject(TYPES.AdminAuthRepository)
        private readonly _adminAuthRepository: IAdminAuthRepository,
		@inject(TYPES.OtpService)
		private readonly _otpService: IOtpService,
	) {}

	public async execute(email: string, otp: string): Promise<string> {

        const user = await this._adminAuthRepository.findByEmail(email)

        if(!user){
            throw new AppError(authConstants.USER_NOT_FOUND, HttpStatus.NOT_FOUND)
        }

		await this._otpService.verifyOtp(email, otp);

        const tempToken = generateTempToken({userId: user.id, role: "admin"})

        return tempToken

	}
}
