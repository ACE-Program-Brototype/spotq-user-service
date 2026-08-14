import type { RefreshTokenEntity } from "../entities/refresh-token.entity.ts";

export interface IRefreshTokenRepository {
	save(refreshToken: RefreshTokenEntity): Promise<void>;
	findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null>;
	revoke(tokenHash: string, revokedAt?: Date): Promise<void>;
	revokeAllForUser(userId: string): Promise<void>;
}
