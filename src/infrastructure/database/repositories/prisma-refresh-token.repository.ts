import type { RefreshTokenEntity } from "@domain/entities/refresh-token.entity.ts";
import type { IRefreshTokenRepository } from "@domain/repositories/refresh-token.repository.interface.ts";
import { prisma } from "@infrastructure/database/prisma/prisma.ts";
import { injectable } from "inversify";
import { RefreshTokenMapper } from "../mappers/refresh-token.mapper.ts";

@injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
	public async save(refreshToken: RefreshTokenEntity): Promise<void> {
		await prisma.refreshToken.create({
			data: {
				id: refreshToken.id,
				userId: refreshToken.userId,
				deviceId: refreshToken.deviceId,
				tokenHash: refreshToken.tokenHash,
				expiresAt: refreshToken.expiresAt,
				createdAt: refreshToken.createdAt,
				revokedAt: refreshToken.revokedAt,
			},
		});
	}

	public async findByTokenHash(
		tokenHash: string,
	): Promise<RefreshTokenEntity | null> {
		const record = await prisma.refreshToken.findFirst({
			where: { tokenHash },
		});

		return record ? RefreshTokenMapper.toDomain(record) : null;
	}

	public async revoke(
		tokenHash: string,
		revokedAt = new Date(),
	): Promise<void> {
		await prisma.refreshToken.updateMany({
			where: { tokenHash },
			data: { revokedAt },
		});
	}

	public async revokeAllForUser(userId: string): Promise<void> {
		await prisma.refreshToken.updateMany({
			where: { userId },
			data: { revokedAt: new Date() },
		});
	}
}
