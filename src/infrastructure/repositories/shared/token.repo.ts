import type { ITokenService } from "@application/ports/service/IToken.service";
import { TYPES } from "@config/di/types";
import type { IRefreshTokenRepository } from "@domain/repository/shared/IToken.repo";
import { inject, injectable } from "inversify";
import type { RedisClientType } from "redis";

@injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
	constructor(
		@inject(TYPES.RedisService)
		private readonly _redis: RedisClientType,
		@inject(TYPES.TokenService)
		private readonly _tokenService: ITokenService
	) {}

	async revoke(token: string, ttlSeconds: number): Promise<void> {
		const key = `auth:revoked-refresh:${this._tokenService.hashRefreshToken(token)}`;

		await this._redis.set(key, "1", {
			EX: ttlSeconds,
		});
	}

	async isRevoked(token: string): Promise<boolean> {
		const key = `auth:revoked-refresh:${this._tokenService.hashRefreshToken(token)}`;

		const exists = await this._redis.exists(key);

		return exists === 1;
	}
}
