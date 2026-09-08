import { UpdateCustomerProfileUseCase } from "@application/use-cases/update-customer-profile.use-case.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import { UserProfileEntity } from "@domain/entities/user-profile.entity.ts";
import { UserNotFoundError } from "@domain/errors/user-not-found.error.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";

describe("UpdateCustomerProfileUseCase", () => {
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let useCase: UpdateCustomerProfileUseCase;

	const fixedDate = new Date("2026-01-15T10:00:00.000Z");
	const originalDob = new Date("1990-05-12T00:00:00.000Z");

	const createMockUser = (overrides?: {
		fullName?: string;
		dob?: Date | null;
		gender?: string | null;
		location?: string | null;
	}): UserEntity => {
		const profileEntity = UserProfileEntity.reconstitute({
			id: "profile-123",
			userId: "user-123",
			dob: overrides?.dob !== undefined ? overrides.dob : originalDob,
			gender: overrides?.gender !== undefined ? overrides.gender : "MALE",
			location:
				overrides?.location !== undefined ? overrides.location : "Kochi",
			createdAt: fixedDate,
			updatedAt: fixedDate,
		});

		return UserEntity.reconstitute({
			id: "user-123",
			fullName: FullName.create(overrides?.fullName ?? "John Doe"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("john.doe@example.com"),
			passwordHash: "hashed_password",
			googleId: null,
			status: UserStatus.ACTIVE,
			isEmailVerified: true,
			createdAt: fixedDate,
			updatedAt: fixedDate,
			profile: profileEntity,
		});
	};

	beforeEach(() => {
		mockUserRepository = {
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			find: jest.fn(),
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByPhone: jest.fn(),
			findByGoogleId: jest.fn(),
			createWithSession: jest.fn(),
			updateProfile: jest.fn(),
		};

		useCase = new UpdateCustomerProfileUseCase(mockUserRepository);
	});

	it("should update full profile fields and return updated customer profile DTO", async () => {
		const existingUser = createMockUser();
		const updatedUser = createMockUser({
			fullName: "Rahul Sharma",
			dob: new Date("1995-06-20T00:00:00.000Z"),
			gender: "MALE",
			location: "Bengaluru",
		});

		mockUserRepository.findById.mockResolvedValue(existingUser);
		mockUserRepository.updateProfile.mockResolvedValue(updatedUser);

		const result = await useCase.execute("user-123", {
			full_name: "Rahul Sharma",
			dob: "1995-06-20",
			gender: "MALE",
			location: "Bengaluru",
		});

		expect(mockUserRepository.findById).toHaveBeenCalledWith("user-123");
		expect(mockUserRepository.updateProfile).toHaveBeenCalledWith({
			userId: "user-123",
			fullName: "Rahul Sharma",
			dob: new Date("1995-06-20"),
			gender: "MALE",
			location: "Bengaluru",
		});
		expect(result).toEqual({
			id: "user-123",
			full_name: "Rahul Sharma",
			email: "john.doe@example.com",
			phone: "+919876543210",
			status: "ACTIVE",
			gender: "MALE",
			dob: "1995-06-20",
			location: "Bengaluru",
			default_address: null,
			created_at: fixedDate.toISOString(),
			updated_at: fixedDate.toISOString(),
		});
	});

	it("should support updating full_name directly without splitting", async () => {
		const existingUser = createMockUser({ fullName: "John Doe" });
		const updatedUser = createMockUser({ fullName: "Jonathan Doe" });

		mockUserRepository.findById.mockResolvedValue(existingUser);
		mockUserRepository.updateProfile.mockResolvedValue(updatedUser);

		const result = await useCase.execute("user-123", {
			full_name: "Jonathan Doe",
		});

		expect(mockUserRepository.updateProfile).toHaveBeenCalledWith({
			userId: "user-123",
			fullName: "Jonathan Doe",
		});
		expect(result.full_name).toBe("Jonathan Doe");
	});

	it("should support clearing nullable profile fields", async () => {
		const existingUser = createMockUser({ fullName: "John Doe" });
		const updatedUser = createMockUser({
			fullName: "John Doe",
			dob: null,
			gender: null,
			location: null,
		});

		mockUserRepository.findById.mockResolvedValue(existingUser);
		mockUserRepository.updateProfile.mockResolvedValue(updatedUser);

		const result = await useCase.execute("user-123", {
			dob: null,
			gender: null,
			location: null,
		});

		expect(mockUserRepository.updateProfile).toHaveBeenCalledWith({
			userId: "user-123",
			dob: null,
			gender: null,
			location: null,
		});
		expect(result.dob).toBeNull();
		expect(result.gender).toBeNull();
		expect(result.location).toBeNull();
	});

	it("should throw UserNotFoundError when user does not exist", async () => {
		mockUserRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute("non-existent-user", { full_name: "Alex" }),
		).rejects.toThrow(UserNotFoundError);

		expect(mockUserRepository.updateProfile).not.toHaveBeenCalled();
	});
});
