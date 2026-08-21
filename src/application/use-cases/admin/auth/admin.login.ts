import type { AdminLoginDTO } from "@application/dtos/admin/auth/admin.login.dto";
import { toAdminLoginResponse } from "@application/mappers/admin/auth/admin.login.mapper";
import type { IPasswordHasher } from "@application/ports/service/IPassword.service";
import type { ITokenService } from "@application/ports/service/IToken.service";
import type { IAdminLoginUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.login";
import { TYPES } from "@config/di/types.ts";
import { Admin } from "@domain/entities/admin";
import type { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";
import { authConstants } from "@shared/constants/auth.constants";
import { HttpStatus } from "@shared/constants/http.constants";
import { AppError } from "@shared/util/app.error";
import { inject, injectable } from "inversify";

@injectable()
export class AdminLoginUseCase implements IAdminLoginUseCase {
	constructor(
		@inject(TYPES.AdminAuthRepository)
		private readonly _adminRepository: IAdminAuthRepository,
		@inject(TYPES.PasswordService)
		private readonly _passwordService: IPasswordHasher,
		@inject(TYPES.TokenService)
		private readonly _tokenService: ITokenService,
	) {}

	async execute(email: string, password: string): Promise<AdminLoginDTO> {
		const user = await this._adminRepository.findByEmail(email);

		if (!user) {
			throw new AppError(
				authConstants.INVALID_CREDENTIALS,
				HttpStatus.NOT_FOUND,
			);
		}

		const isPasswordValid = await this._passwordService.verifyPassword(
			password,
			user.passwordHash,
		);

		if (!isPasswordValid) {
			throw new AppError(
				authConstants.INVALID_CREDENTIALS,
				HttpStatus.BAD_REQUEST,
			);
		}

		const role = "admin";

		const accessToken = this._tokenService.generateAccessToken({
			userId: user.id,
			role,
		});
		const refreshToken = this._tokenService.generateRefreshToken({
			userId: user.id,
			role,
		});

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
