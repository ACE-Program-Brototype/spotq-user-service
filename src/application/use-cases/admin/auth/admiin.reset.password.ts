import type { AdminResetPasswordDto } from "@application/dtos/admin/auth/admin.forgot-password";
import type { IAdminResetPasswordUseCase } from "@application/interface/admin/auth/IAdmin.reset.password";
import { toAdminResetPasswordResponse } from "@application/mappers/admin/auth/admin.reset.password.mapper";
import { TYPES } from "@config/di";
import { Admin } from "@domain/entities/admin";
import type { IAdminAuthRepository } from "@infrastructure/interface/admin/IAdmin.auth.repo";
import { hashPassword } from "@infrastructure/services/password";
import { HttpStatus } from "@shared/constants";
import { authConstants } from "@shared/constants/auth.constants";
import { AppError } from "@shared/util/app.error";
import { inject, injectable } from "inversify";

@injectable()
export class AdminResetPasswordUseCase implements IAdminResetPasswordUseCase {
	constructor(
		@inject(TYPES.AdminAuthRepository)
		private readonly _adminAuthRepository: IAdminAuthRepository,
	) {}

	async execute(
		userId: string,
		password: string,
	): Promise<AdminResetPasswordDto | null> {
		const user = await this._adminAuthRepository.findById(userId);

		if (!user) {
			throw new AppError(authConstants.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
		}

		const passwordHash = await hashPassword(password);

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
