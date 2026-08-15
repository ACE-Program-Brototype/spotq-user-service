import { RefreshTokenEntity } from "@domain/entities/refresh-token.entity.ts";

describe("RefreshTokenEntity", () => {
	it("should create a new active refresh token entity", () => {
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		const token = RefreshTokenEntity.create({
			id: "token-1",
			userId: "usr-1",
			tokenHash: "hashed-token-xyz",
			expiresAt,
			deviceId: "dev-1",
		});

		expect(token.id).toBe("token-1");
		expect(token.userId).toBe("usr-1");
		expect(token.deviceId).toBe("dev-1");
		expect(token.tokenHash).toBe("hashed-token-xyz");
		expect(token.expiresAt).toBe(expiresAt);
		expect(token.revokedAt).toBeNull();
		expect(token.isRevoked()).toBe(false);
		expect(token.isExpired()).toBe(false);
		expect(token.isValid()).toBe(true);
	});

	it("should correctly identify revoked tokens", () => {
		const expiresAt = new Date(Date.now() + 10000);
		const token = RefreshTokenEntity.create({
			id: "token-2",
			userId: "usr-1",
			tokenHash: "hash-123",
			expiresAt,
		});

		token.revoke();
		expect(token.isRevoked()).toBe(true);
		expect(token.isValid()).toBe(false);
		expect(token.revokedAt).toBeInstanceOf(Date);
	});

	it("should correctly identify expired tokens", () => {
		const pastDate = new Date(Date.now() - 10000);
		const token = RefreshTokenEntity.create({
			id: "token-3",
			userId: "usr-1",
			tokenHash: "hash-expired",
			expiresAt: pastDate,
		});

		expect(token.isExpired()).toBe(true);
		expect(token.isValid()).toBe(false);
	});
});
