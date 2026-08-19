import type { ITokenService } from "@application/ports/service/IToken.service";
import type { IAdminLogoutUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.logout";
import { TYPES } from "@config/di/types";
import type { IRefreshTokenRepository } from "@domain/repository/shared/IToken.repo";
import { inject, injectable } from "inversify";

@injectable()
export class AdminLogoutUseCase implements IAdminLogoutUseCase {
	constructor(
		@inject(TYPES.RefreshTokenRepository)
		private readonly _refreshTokenRepository: IRefreshTokenRepository,
		@inject(TYPES.TokenService)
		private readonly _tokenService: ITokenService,
	) {}

	async execute(refreshToken: string): Promise<void> {
		const ttlSeconds = this._tokenService.getTokenTTL(refreshToken);

		if (ttlSeconds <= 0) {
			return;
		}

		await this._refreshTokenRepository.revoke(refreshToken, ttlSeconds);
	}
}
