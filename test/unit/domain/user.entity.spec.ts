import { RefreshTokenEntity } from "@domain/entities/refresh-token.entity.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";

describe("Domain Entities", () => {
	describe("UserEntity", () => {
		it("should create user entity with ACTIVE status", () => {
			const user = UserEntity.create({
				id: "123e4567-e89b-12d3-a456-426614174000",
				fullName: FullName.create("Jane Doe"),
				phone: PhoneNumber.create("+919876543210"),
				email: Email.create("jane.doe@example.com"),
				passwordHash: "hashed_password",
			});

			expect(user.id).toBe("123e4567-e89b-12d3-a456-426614174000");
			expect(user.fullName.getValue()).toBe("Jane Doe");
			expect(user.phone?.getValue()).toBe("+919876543210");
			expect(user.email.getValue()).toBe("jane.doe@example.com");
			expect(user.status).toBe(UserStatus.ACTIVE);
			expect(user.createdAt).toBeInstanceOf(Date);
		});

		it("should create user entity directly from raw string parameters", () => {
			const user = UserEntity.create({
				id: "123e4567-e89b-12d3-a456-426614174000",
				fullName: "Jane Doe",
				phone: "+919876543210",
				email: "jane.doe@example.com",
				passwordHash: "hashed_password",
			});

			expect(user.id).toBe("123e4567-e89b-12d3-a456-426614174000");
			expect(user.fullName.getValue()).toBe("Jane Doe");
			expect(user.phone.getValue()).toBe("+919876543210");
			expect(user.email.getValue()).toBe("jane.doe@example.com");
			expect(user.status).toBe(UserStatus.ACTIVE);
			expect(user.createdAt).toBeInstanceOf(Date);
		});
	});

	describe("RefreshTokenEntity", () => {
		it("should correctly report validity, expiration, and revocation", () => {
			const validToken = RefreshTokenEntity.create({
				id: "tok_1",
				userId: "usr_1",
				tokenHash: "hash_abc",
				expiresAt: new Date(Date.now() + 60000), // 1 min in future
			});

			expect(validToken.isValid()).toBe(true);
			expect(validToken.isRevoked()).toBe(false);
			expect(validToken.isExpired()).toBe(false);

			validToken.revoke();
			expect(validToken.isRevoked()).toBe(true);
			expect(validToken.isValid()).toBe(false);

			const expiredToken = RefreshTokenEntity.create({
				id: "tok_2",
				userId: "usr_1",
				tokenHash: "hash_def",
				expiresAt: new Date(Date.now() - 60000), // 1 min in past
			});

			expect(expiredToken.isExpired()).toBe(true);
			expect(expiredToken.isValid()).toBe(false);
		});
	});
});
