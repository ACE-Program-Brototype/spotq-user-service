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
};
