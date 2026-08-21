import type { IAdminForgotPasswordUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.forgot-password";
import { TYPES } from "@config/di/types.ts";
import { InvalidCredentialsError } from "@domain/errors/invalid.credentials.error";
import type { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";
import type { IEmailQueueProducer } from "@domain/repository/shared/IEmail.queue.producer";
import type { IOtpService } from "@domain/repository/shared/IOtp.service";
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
			throw new InvalidCredentialsError();
		}

		const otp = await this._otpService.generateAndStoreOtp(user.email);

		await this._emailQueueProducer.queueVerificationEmail({
			email: email,
			otp,
		});
	}
}
