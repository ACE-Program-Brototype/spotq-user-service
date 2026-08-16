import type { IAdminLogoutUseCase } from "@application/interface/admin/auth/IAdmin.logout";
import { TYPES } from "@config/di/types";
import type { IRefreshTokenRepository } from "@infrastructure/interface/shared/IToken.repo";
import { getTokenTTL } from "@infrastructure/services/token";
import { inject, injectable } from "inversify";

@injectable()
export class AdminLogoutUseCase implements IAdminLogoutUseCase {
	constructor(
		@inject(TYPES.RefreshTokenRepository)
		private readonly _refreshTokenRepository: IRefreshTokenRepository,
	) {}

	async execute(refreshToken: string): Promise<void> {
		const ttlSeconds = getTokenTTL(refreshToken);

		if (ttlSeconds <= 0) {
			return;
		}

		await this._refreshTokenRepository.revoke(refreshToken, ttlSeconds);
	}
}
