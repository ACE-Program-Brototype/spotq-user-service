import type { IAdminTokenService } from "@application/ports/services/IToken.service";
import { TYPES } from "@config/di/types";
import type { IRefreshTokenRepository } from "@domain/repository/shared/IToken.repo";
import { redisClient } from "@infrastructure/redis";
import { inject, injectable } from "inversify";

@injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
	private readonly _redis = redisClient;
	constructor(
		@inject(TYPES.AdminTokenService)
		private readonly _tokenService: IAdminTokenService,
	) {}

	async revoke(token: string, ttlSeconds: number): Promise<void> {
		const key = `auth:revoked-refresh:${this._tokenService.hashToken(token)}`;

		await this._redis.set(key, "1", {
			EX: ttlSeconds,
		});
	}

	async isRevoked(token: string): Promise<boolean> {
		const key = `auth:revoked-refresh:${this._tokenService.hashToken(token)}`;

		const exists = await this._redis.exists(key);

		return exists === 1;
	}
}
