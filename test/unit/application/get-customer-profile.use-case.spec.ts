import { GetCustomerProfileUseCase } from "@application/use-cases/get-customer-profile.use-case.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import { UserProfileEntity } from "@domain/entities/user-profile.entity.ts";
import {
	UserBlockedError,
	UserInactiveError,
	UserNotFoundError,
} from "@domain/errors/index.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";

describe("GetCustomerProfileUseCase", () => {
	let useCase: GetCustomerProfileUseCase;
	let mockUserRepository: jest.Mocked<IUserRepository>;

	beforeEach(() => {
		mockUserRepository = {
			create: jest.fn(),
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByPhone: jest.fn(),
			findByGoogleId: jest.fn(),
			createWithSession: jest.fn(),
			updateProfile: jest.fn(),
		};

		useCase = new GetCustomerProfileUseCase(mockUserRepository);
	});

	it("should return mapped customer profile when user exists and is active", async () => {
		const fixedDate = new Date("2026-01-15T10:00:00.000Z");
		const fixedDob = new Date("1995-05-20T00:00:00.000Z");

		const userEntity = UserEntity.reconstitute({
			id: "user-uuid-1234",
			fullName: FullName.create("John Doe"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("john.doe@example.com"),
			passwordHash: "hashed-pass",
			googleId: null,
			status: UserStatus.ACTIVE,
			isEmailVerified: true,
			createdAt: fixedDate,
			updatedAt: fixedDate,
			profile: UserProfileEntity.reconstitute({
				id: "profile-uuid-1234",
				userId: "user-uuid-1234",
				dob: fixedDob,
				gender: "MALE",
				location: "Ernakulam, Kerala",
				createdAt: fixedDate,
				updatedAt: fixedDate,
			}),
		});

		mockUserRepository.findById.mockResolvedValue(userEntity);

		const result = await useCase.execute("user-uuid-1234");

		expect(mockUserRepository.findById).toHaveBeenCalledWith("user-uuid-1234");
		expect(result).toEqual({
			id: "user-uuid-1234",
			full_name: "John Doe",
			email: "john.doe@example.com",
			phone: "+919876543210",
			status: "ACTIVE",
			gender: "MALE",
			dob: "1995-05-20",
			location: "Ernakulam, Kerala",
			created_at: fixedDate.toISOString(),
			updated_at: fixedDate.toISOString(),
		});
	});

	it("should throw UserNotFoundError when user is not found", async () => {
		mockUserRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute("non-existent-id")).rejects.toThrow(
			UserNotFoundError,
		);
		expect(mockUserRepository.findById).toHaveBeenCalledWith("non-existent-id");
	});

	it("should throw UserBlockedError when user status is BLOCKED", async () => {
		const fixedDate = new Date("2026-01-15T10:00:00.000Z");
		const userEntity = UserEntity.reconstitute({
			id: "user-blocked-123",
			fullName: FullName.create("Blocked User"),
			phone: null,
			email: Email.create("blocked@example.com"),
			passwordHash: "hashed-pass",
			googleId: null,
			status: UserStatus.BLOCKED,
			isEmailVerified: true,
			createdAt: fixedDate,
			updatedAt: fixedDate,
		});

		mockUserRepository.findById.mockResolvedValue(userEntity);

		await expect(useCase.execute("user-blocked-123")).rejects.toThrow(
			UserBlockedError,
		);
	});

	it("should throw UserInactiveError when user status is INACTIVE", async () => {
		const fixedDate = new Date("2026-01-15T10:00:00.000Z");
		const userEntity = UserEntity.reconstitute({
			id: "user-inactive-123",
			fullName: FullName.create("Inactive User"),
			phone: null,
			email: Email.create("inactive@example.com"),
			passwordHash: "hashed-pass",
			googleId: null,
			status: UserStatus.INACTIVE,
			isEmailVerified: true,
			createdAt: fixedDate,
			updatedAt: fixedDate,
		});

		mockUserRepository.findById.mockResolvedValue(userEntity);

		await expect(useCase.execute("user-inactive-123")).rejects.toThrow(
			UserInactiveError,
		);
	});
});
