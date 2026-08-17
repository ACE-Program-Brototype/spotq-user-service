import { AdminFotgotPasswordDTO } from "@application/dtos/admin/auth/admin.forgot-password";
import { IAdminForgotPasswordUseCase } from "@application/interface/admin/auth/IAdmin.forgot-password";
import { TYPES } from "@config/di";
import { IAdminAuthRepository } from "@infrastructure/interface/admin/IAdmin.auth.repo";
import { IEmailQueueProducer } from "@infrastructure/interface/shared/IEmail.queue.producer";
import { IOtpService } from "@infrastructure/interface/shared/IOtp.service";
import { logger } from "@infrastructure/logger";
import { generateTempToken } from "@infrastructure/services/token";
import { HttpStatus } from "@shared/constants";
import { authConstants } from "@shared/constants/auth.constants";
import { AppError } from "@shared/util/app.error";
import { inject, injectable } from "inversify";


@injectable()
export class AdminForgotPasswordUseCase implements IAdminForgotPasswordUseCase {
    constructor(
        @inject(TYPES.AdminAuthRepository)
        private readonly _adminAuthRepository: IAdminAuthRepository,
        @inject(TYPES.OtpService)
        private readonly _otpService: IOtpService,
        @inject(TYPES.EmailQueueProducer)
        private readonly _emailQueueProducer: IEmailQueueProducer
    ) { }

    async execute(email: string): Promise<AdminFotgotPasswordDTO | null> {

        const user = await this._adminAuthRepository.findByEmail(email)

        if (!user) {
            throw new AppError(authConstants.USER_NOT_FOUND, HttpStatus.NOT_FOUND)
        }

        const role = "admin"

        const otp = await this._otpService.generateAndStoreOtp(user.email)

        try {
            await this._emailQueueProducer.queueVerificationEmail({
                email: email,
                otp,
            });

            console.log("EMAIL_SENDED")
        } catch (error) {
            logger.error(
                { err: error, userId: user.id },
                "Verification email queuing failed after user registration",
            );
        }

        const temp_token = generateTempToken({ userId: user.id, role })

        return {
            temp_token
        }

    }
}