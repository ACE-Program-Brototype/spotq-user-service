import { TYPES } from "@config/di/types";
import type { IRefreshTokenRepository } from "@infrastructure/interface/shared/IToken.repo";
import { hashRefreshToken } from "@infrastructure/services/token";
import { inject, injectable } from "inversify";
import type { RedisClientType } from "redis";

@injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
	constructor(
		@inject(TYPES.RedisService)
		private readonly _redis: RedisClientType,
	) {}

	async revoke(token: string, ttlSeconds: number): Promise<void> {
		const key = `auth:revoked-refresh:${hashRefreshToken(token)}`;

		await this._redis.set(key, "1", {
			EX: ttlSeconds,
		});
	}

	async isRevoked(token: string): Promise<boolean> {
		const key = `auth:revoked-refresh:${hashRefreshToken(token)}`;

		const exists = await this._redis.exists(key);

		return exists === 1;
	}
}
