import { UserStatus } from "@domain/entities/user.entity.ts";
import { UserNotFoundError } from "@domain/errors/domain.error.ts";
import { prisma } from "@infrastructure/database/prisma/prisma.ts";
import { PrismaUserRepository } from "@infrastructure/database/repositories/prisma-user.repository.ts";
import { Prisma } from "@prisma/client";

jest.mock("@infrastructure/database/prisma/prisma.ts", () => ({
	prisma: {
		$transaction: jest.fn(),
		user: {
			update: jest.fn(),
		},
		refreshToken: {
			updateMany: jest.fn(),
		},
	},
}));

describe("PrismaUserRepository - updateStatus", () => {
	let repository: PrismaUserRepository;

	const mockPrismaUser = {
		id: "usr_01HX8Z9Q7K",
		fullname: "Alice Walker",
		phone: "+919876543210",
		email: "alice@example.com",
		passwordHash: "hash-secret-password",
		googleId: null,
		status: "BLOCKED",
		isEmailVerified: true,
		createdAt: new Date("2026-03-01T10:00:00.000Z"),
		updatedAt: new Date("2026-03-01T12:00:00.000Z"),
		profile: null,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		repository = new PrismaUserRepository();
	});

	it("should update user status and revoke tokens within atomic transaction when revokeTokens is true", async () => {
		const mockTx = {
			user: {
				update: jest.fn().mockResolvedValue(mockPrismaUser),
			},
			refreshToken: {
				updateMany: jest.fn().mockResolvedValue({ count: 2 }),
			},
		};

		(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
			return callback(mockTx);
		});

		const result = await repository.updateStatus(
			"usr_01HX8Z9Q7K",
			UserStatus.BLOCKED,
			true,
		);

		expect(prisma.$transaction).toHaveBeenCalledTimes(1);
		expect(mockTx.user.update).toHaveBeenCalledWith({
			where: { id: "usr_01HX8Z9Q7K" },
			data: { status: "BLOCKED" },
			include: { profile: true },
		});
		expect(mockTx.refreshToken.updateMany).toHaveBeenCalledWith({
			where: { userId: "usr_01HX8Z9Q7K" },
			data: { revokedAt: expect.any(Date) },
		});
		expect(result.id).toBe("usr_01HX8Z9Q7K");
		expect(result.status).toBe(UserStatus.BLOCKED);
	});

	it("should update user status without revoking tokens when revokeTokens is false", async () => {
		const mockTx = {
			user: {
				update: jest.fn().mockResolvedValue({
					...mockPrismaUser,
					status: "ACTIVE",
				}),
			},
			refreshToken: {
				updateMany: jest.fn(),
			},
		};

		(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
			return callback(mockTx);
		});

		const result = await repository.updateStatus(
			"usr_01HX8Z9Q7K",
			UserStatus.ACTIVE,
			false,
		);

		expect(prisma.$transaction).toHaveBeenCalledTimes(1);
		expect(mockTx.user.update).toHaveBeenCalledWith({
			where: { id: "usr_01HX8Z9Q7K" },
			data: { status: "ACTIVE" },
			include: { profile: true },
		});
		expect(mockTx.refreshToken.updateMany).not.toHaveBeenCalled();
		expect(result.status).toBe(UserStatus.ACTIVE);
	});

	it("should throw UserNotFoundError when prisma throws P2025 known request error", async () => {
		const p2025Error = new Prisma.PrismaClientKnownRequestError(
			"Record to update not found",
			{ code: "P2025", clientVersion: "5.0.0" },
		);

		(prisma.$transaction as jest.Mock).mockRejectedValue(p2025Error);

		await expect(
			repository.updateStatus("usr_missing", UserStatus.BLOCKED, true),
		).rejects.toThrow(UserNotFoundError);
	});

	it("should propagate transaction failure without partial mutation", async () => {
		(prisma.$transaction as jest.Mock).mockRejectedValue(
			new Error("Connection reset during transaction"),
		);

		await expect(
			repository.updateStatus("usr_01HX8Z9Q7K", UserStatus.BLOCKED, true),
		).rejects.toThrow("Connection reset during transaction");
	});
});
