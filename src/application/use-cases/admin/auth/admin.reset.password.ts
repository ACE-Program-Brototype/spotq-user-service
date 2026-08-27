import type { AdminResetPasswordDto } from "@application/dtos/admin/auth/admin.forgot-password";
import { toAdminResetPasswordResponse } from "@application/mappers/admin/auth/admin.reset.password.mapper";
import type { IPasswordHashService } from "@application/ports/services";
import type { IAdminResetPasswordUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.reset.password";
import { TYPES } from "@config/di/types.ts";
import { Admin } from "@domain/entities/admin";
import { ResetPasswordFailedError } from "@domain/errors/reset.password.error";
import { UserNotFoundError } from "@domain/errors/user.not-found.error";
import type { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";
import { inject, injectable } from "inversify";

@injectable()
export class AdminResetPasswordUseCase implements IAdminResetPasswordUseCase {
	constructor(
		@inject(TYPES.AdminAuthRepository)
		private readonly _adminAuthRepository: IAdminAuthRepository,
		@inject(TYPES.PasswordService)
		private readonly _passwordService: IPasswordHashService,
	) {}

	async execute(
		userId: string,
		password: string,
	): Promise<AdminResetPasswordDto | null> {
		const user = await this._adminAuthRepository.findById(userId);

		if (!user) {
			throw new UserNotFoundError();
		}

		const passwordHash = await this._passwordService.hashPassword(password);

		const updatedUser = await this._adminAuthRepository.update(userId, {
			passwordHash,
		});

		if (!updatedUser) {
			throw new ResetPasswordFailedError();
		}

		const updatedDomainUser = new Admin(
			updatedUser.id,
			updatedUser.name,
			updatedUser.email,
			updatedUser.passwordHash,
			updatedUser.createdAt,
			updatedUser.updatedAt,
		);

		return toAdminResetPasswordResponse(updatedDomainUser);
	}
}
