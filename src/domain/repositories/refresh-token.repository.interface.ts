import type { RefreshTokenEntity } from "../entities/refresh-token.entity.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface IRefreshTokenRepository extends IBaseRepository<RefreshTokenEntity> {
	save(refreshToken: RefreshTokenEntity): Promise<void>;
	findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null>;
	revoke(tokenHash: string, revokedAt?: Date): Promise<void>;
	revokeAllForUser(userId: string): Promise<void>;
}
