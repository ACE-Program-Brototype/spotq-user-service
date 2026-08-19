import type { AdminResetPasswordDto } from "@application/dtos/admin/auth/admin.forgot-password";
import { toAdminResetPasswordResponse } from "@application/mappers/admin/auth/admin.reset.password.mapper";
import { IPasswordHasher } from "@application/ports/service/IPassword.service";
import { IAdminResetPasswordUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.reset.password";
import { TYPES } from "@config/di/types.ts";
import { Admin } from "@domain/entities/admin";
import { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";
import { HttpStatus } from "@shared/constants";
import { authConstants } from "@shared/constants/auth.constants";
import { AppError } from "@shared/util/app.error";
import { inject, injectable } from "inversify";

@injectable()
export class AdminResetPasswordUseCase implements IAdminResetPasswordUseCase {
	constructor(
		@inject(TYPES.AdminAuthRepository)
		private readonly _adminAuthRepository: IAdminAuthRepository,
		@inject(TYPES.PasswordService)
		private readonly _passwordService: IPasswordHasher
	) {}

	async execute(
		userId: string,
		password: string,
	): Promise<AdminResetPasswordDto | null> {
		const user = await this._adminAuthRepository.findById(userId);

		if (!user) {
			throw new AppError(authConstants.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
		}

		const passwordHash = await this._passwordService.hashPassword(password);

		const updatedUser = await this._adminAuthRepository.update(userId, {
			passwordHash,
		});

		if (!updatedUser) {
			throw new AppError(
				authConstants.RESET_PASSWORD_FAILED,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
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
