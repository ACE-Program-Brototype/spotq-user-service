import { IAdminForgotPasswordUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.forgot-password";
import { TYPES } from "@config/di/types.ts";
import { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";
import { IEmailQueueProducer } from "@domain/repository/shared/IEmail.queue.producer";
import { IOtpService } from "@domain/repository/shared/IOtp.service";
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
		private readonly _emailQueueProducer: IEmailQueueProducer,
	) {}

	async execute(email: string): Promise<void> {
		const user = await this._adminAuthRepository.findByEmail(email);

		if (!user) {
			throw new AppError(authConstants.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
		}

		const otp = await this._otpService.generateAndStoreOtp(user.email);

		await this._emailQueueProducer.queueVerificationEmail({
			email: email,
			otp,
		});
	}
}
