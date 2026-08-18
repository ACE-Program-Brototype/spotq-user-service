import { RefreshTokenEntity } from "@domain/entities/refresh-token.entity.ts";
import type { RefreshToken as PrismaRefreshTokenModel } from "@prisma/client";

export const RefreshTokenMapper = {
	toDomain(raw: PrismaRefreshTokenModel): RefreshTokenEntity {
		return RefreshTokenEntity.reconstitute({
			id: raw.id,
			userId: raw.userId,
			deviceId: raw.deviceId,
			tokenHash: raw.tokenHash,
			expiresAt: raw.expiresAt,
			createdAt: raw.createdAt,
			revokedAt: raw.revokedAt,
		});
	},

	toPersistence(entity: RefreshTokenEntity): any {
		return {
			id: entity.id,
			userId: entity.userId,
			deviceId: entity.deviceId,
			tokenHash: entity.tokenHash,
			expiresAt: entity.expiresAt,
			createdAt: entity.createdAt,
			revokedAt: entity.revokedAt,
		};
	},
};
