import type { AdminLoginDTO } from "@application/dtos/admin/auth/admin.login.dto";
import { toAdminLoginResponse } from "@application/mappers/admin/auth/admin.login.mapper";
import type { ITokenService } from "@application/ports/services/IToken.service";
import type { IAdminRefreshTokenUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.refresh-token";
import { TYPES } from "@config/di/types";
import { Admin } from "@domain/entities/admin";
import { UserNotFoundError } from "@domain/errors/user.not-found.error";
import type { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";
import type { IRefreshTokenRepository } from "@domain/repository/shared/IToken.repo";
import { authConstants, USER_ROLES } from "@shared/constants/auth.constants";
import { HttpStatus } from "@shared/constants/http.constants";
import { AppError } from "@shared/util/app.error";
import { inject, injectable } from "inversify";

@injectable()
export class AdminRefreshTokenUseCase implements IAdminRefreshTokenUseCase {
	constructor(
		@inject(TYPES.AdminAuthRepository)
		private readonly _adminAuthRepo: IAdminAuthRepository,
		@inject(TYPES.RefreshTokenRepositories)
		private readonly _refreshTokenRepo: IRefreshTokenRepository,
		@inject(TYPES.TokenServices)
		private readonly _tokenService: ITokenService,
	) {}

	async execute(refreshToken: string): Promise<AdminLoginDTO> {
		if (
			!refreshToken ||
			typeof refreshToken !== "string" ||
			!refreshToken.trim()
		) {
			throw new AppError(
				authConstants.REFRESH_TOKEN_MISSING,
				HttpStatus.BAD_REQUEST,
			);
		}

		const isRevoked = await this._refreshTokenRepo.isRevoked(refreshToken);
		if (isRevoked) {
			throw new AppError(
				authConstants.INVALID_REFRESH_TOKEN,
				HttpStatus.UNAUTHORIZED,
			);
		}

		let decoded: { sub?: string; email?: string; role?: string };
		try {
			decoded = this._tokenService.verifyRefreshToken<{
				sub?: string;
				email?: string;
				role?: string;
			}>(refreshToken);
		} catch (_err) {
			throw new AppError(
				authConstants.INVALID_REFRESH_TOKEN,
				HttpStatus.UNAUTHORIZED,
			);
		}

		if (!decoded?.sub) {
			throw new AppError(
				authConstants.INVALID_REFRESH_TOKEN,
				HttpStatus.UNAUTHORIZED,
			);
		}

		const user = await this._adminAuthRepo.findById(decoded.sub);
		if (!user) {
			throw new UserNotFoundError();
		}

		const ttlSeconds =
			this._tokenService.getTokenTTL(refreshToken) || 7 * 24 * 60 * 60;
		if (ttlSeconds > 0) {
			await this._refreshTokenRepo.revoke(refreshToken, ttlSeconds);
		}

		const role = USER_ROLES.ADMIN;
		const newAccessToken = this._tokenService.generateAccessToken({
			sub: user.id,
			email: user.email,
			role,
		});
		const newRefreshToken = this._tokenService.generateRefreshToken({
			sub: user.id,
			email: user.email,
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

		return toAdminLoginResponse(domainUser, newAccessToken, newRefreshToken);
	}
}
