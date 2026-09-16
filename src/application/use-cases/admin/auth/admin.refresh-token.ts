import type { AdminLoginDTO } from "@application/dtos/admin/auth/admin.login.dto";
import { toAdminLoginResponse } from "@application/mappers/admin/auth/admin.login.mapper";
import type { ITokenService } from "@application/ports/services/index.ts";
import type { IAdminRefreshTokenUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.refresh-token";
import { TYPES } from "@config/di/types.ts";
import { Admin } from "@domain/entities/admin";
import { InvalidTokenError } from "@domain/errors/index.ts";
import type { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";
import { inject, injectable } from "inversify";

@injectable()
export class AdminRefreshTokenUseCase implements IAdminRefreshTokenUseCase {
	constructor(
		@inject(TYPES.AdminAuthRepository)
		private readonly _adminAuthRepo: IAdminAuthRepository,
		@inject(TYPES.TokenServices)
		private readonly _tokenService: ITokenService,
	) {}

	async execute(refreshToken: string): Promise<AdminLoginDTO> {
		if (!refreshToken?.trim()) {
			throw new InvalidTokenError("Missing refresh token.");
		}

		let decoded: { userId?: string; sub?: string; role?: string };
		try {
			decoded = this._tokenService.verifyRefreshToken<{
				userId?: string;
				sub?: string;
				role?: string;
			}>(refreshToken.trim());
		} catch {
			throw new InvalidTokenError("Invalid or expired refresh token.");
		}

		const userId = decoded.sub || decoded.userId;
		if (!userId || decoded?.role !== "admin") {
			throw new InvalidTokenError("Invalid admin refresh token.");
		}

		const user = await this._adminAuthRepo.findById(userId);
		if (!user) {
			throw new InvalidTokenError("Admin user not found.");
		}

		const role = "admin";
		const newAccessToken = this._tokenService.generateAccessToken({
			sub: user.id,
			userId: user.id,
			email: user.email,
			role,
		});
		const newRefreshToken = this._tokenService.generateRefreshToken({
			sub: user.id,
			userId: user.id,
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
