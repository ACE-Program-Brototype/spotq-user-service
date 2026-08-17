import type { AdminLoginDTO } from "@application/dtos/admin/auth/admin.login.dto";
import type { IAdminLoginUseCase } from "@application/interface/admin/auth/IAdmin.login";
import { toAdminLoginResponse } from "@application/mappers/admin/auth/admin.login.mapper";
import { TYPES } from "@config/di/types.ts";
import { Admin } from "@domain/entities/admin";
import type { IAdminAuthRepository } from "@infrastructure/interface/admin/IAdmin.auth.repo";
import { verifyPassword } from "@infrastructure/services/password";
import {
	generateAccessToken,
	generateRefreshToken,
} from "@infrastructure/services/token";
import { loginConstants } from "@shared/constants/auth.constants";
import { HttpStatus } from "@shared/constants/http.constants";
import { AppError } from "@shared/util/app.error";
import { inject, injectable } from "inversify";

@injectable()
export class AdminLoginUseCase implements IAdminLoginUseCase {
	constructor(
		@inject(TYPES.AdminAuthRepository)
		private readonly _adminRepository: IAdminAuthRepository,
	) {}

	async execute(
		email: string,
		password: string,
	): Promise<AdminLoginDTO | null> {
		const user = await this._adminRepository.findByEmail(email);

		if (!user) {
			throw new AppError(loginConstants.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
		}

		const isPasswordValid = await verifyPassword(password, user.passwordHash);

		if (!isPasswordValid) {
			throw new AppError(
				loginConstants.INVALID_PASSWORD,
				HttpStatus.BAD_REQUEST,
			);
		}

		const role = "admin";

		const accessToken = generateAccessToken({ userId: user.id, role });
		const refreshToken = generateRefreshToken({ userId: user.id, role });

		const domainUser = new Admin(
			user.id,
			user.name,
			user.email,
			user.passwordHash,
			user.createdAt,
			user.updatedAt,
		);

		return toAdminLoginResponse(domainUser, accessToken, refreshToken);
	}
}
