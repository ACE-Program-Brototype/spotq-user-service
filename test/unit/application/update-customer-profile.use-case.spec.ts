import { UpdateCustomerProfileUseCase } from "@application/use-cases/update-customer-profile.use-case.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import { UserProfileEntity } from "@domain/entities/user-profile.entity.ts";
import {
	UserBlockedError,
	UserInactiveError,
	UserNotFoundError,
} from "@domain/errors/index.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";

describe("UpdateCustomerProfileUseCase", () => {
	let useCase: UpdateCustomerProfileUseCase;
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

		useCase = new UpdateCustomerProfileUseCase(mockUserRepository);
	});

	it("should successfully update profile and return formatted response DTO", async () => {
		const fixedDate = new Date("2026-01-15T10:00:00.000Z");
		const existingUser = UserEntity.reconstitute({
			id: "user-123",
			fullName: FullName.create("John Doe"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("john.doe@example.com"),
			passwordHash: "hashed-pass",
			googleId: null,
			status: UserStatus.ACTIVE,
			isEmailVerified: true,
			createdAt: fixedDate,
			updatedAt: fixedDate,
		});

		const updatedUser = UserEntity.reconstitute({
			id: "user-123",
			fullName: FullName.create("Jane Doe"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("john.doe@example.com"),
			passwordHash: "hashed-pass",
			googleId: null,
			status: UserStatus.ACTIVE,
			isEmailVerified: true,
			createdAt: fixedDate,
			updatedAt: fixedDate,
			profile: UserProfileEntity.reconstitute({
				id: "profile-123",
				userId: "user-123",
				dob: new Date("1995-05-20T00:00:00.000Z"),
				gender: "FEMALE",
				createdAt: fixedDate,
				updatedAt: fixedDate,
			}),
		});

		mockUserRepository.findById.mockResolvedValue(existingUser);
		mockUserRepository.updateProfile.mockResolvedValue(updatedUser);

		const result = await useCase.execute("user-123", {
			full_name: "Jane Doe",
			gender: "FEMALE",
			dob: "1995-05-20",
		});

		expect(mockUserRepository.findById).toHaveBeenCalledWith("user-123");
		expect(mockUserRepository.updateProfile).toHaveBeenCalledWith({
			userId: "user-123",
			fullName: "Jane Doe",
			gender: "FEMALE",
			dob: new Date("1995-05-20"),
		});
		expect(result).toEqual({
			id: "user-123",
			full_name: "Jane Doe",
			email: "john.doe@example.com",
			phone: "+919876543210",
			status: "ACTIVE",
			gender: "FEMALE",
			dob: "1995-05-20",
			created_at: fixedDate.toISOString(),
			updated_at: fixedDate.toISOString(),
		});
	});

	it("should throw UserNotFoundError when user to update does not exist", async () => {
		mockUserRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute("non-existent-user", { full_name: "Test Name" }),
		).rejects.toThrow(UserNotFoundError);
	});

	it("should throw UserBlockedError when user to update is blocked", async () => {
		const fixedDate = new Date("2026-01-15T10:00:00.000Z");
		const blockedUser = UserEntity.reconstitute({
			id: "user-blocked",
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

		mockUserRepository.findById.mockResolvedValue(blockedUser);

		await expect(
			useCase.execute("user-blocked", { full_name: "New Name" }),
		).rejects.toThrow(UserBlockedError);
	});

	it("should throw UserInactiveError when user to update is inactive", async () => {
		const fixedDate = new Date("2026-01-15T10:00:00.000Z");
		const inactiveUser = UserEntity.reconstitute({
			id: "user-inactive",
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

		mockUserRepository.findById.mockResolvedValue(inactiveUser);

		await expect(
			useCase.execute("user-inactive", { full_name: "New Name" }),
		).rejects.toThrow(UserInactiveError);
	});
});
