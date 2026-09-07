import { GetCustomerProfileUseCase } from "@application/use-cases/get-customer-profile.use-case.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import { UserProfileEntity } from "@domain/entities/user-profile.entity.ts";
import { UserNotFoundError } from "@domain/errors/user-not-found.error.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";

describe("GetCustomerProfileUseCase", () => {
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let useCase: GetCustomerProfileUseCase;

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

		useCase = new GetCustomerProfileUseCase(mockUserRepository);
	});

	it("should retrieve complete customer profile when all fields are present", async () => {
		const fixedDate = new Date("2026-01-15T10:00:00.000Z");
		const birthDate = new Date("1995-06-20T00:00:00.000Z");

		const profileEntity = UserProfileEntity.reconstitute({
			id: "profile-123",
			userId: "user-123",
			avatarUrl: "https://cdn.spotq.com/avatars/user-123.jpg",
			dob: birthDate,
			gender: "MALE",
			location: "Kochi, Kerala",
			createdAt: fixedDate,
			updatedAt: fixedDate,
		});

		const userEntity = UserEntity.reconstitute({
			id: "user-123",
			fullName: FullName.create("Rahul Sharma"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("rahul.sharma@example.com"),
			passwordHash: "hashed_password",
			googleId: null,
			status: UserStatus.ACTIVE,
			isEmailVerified: true,
			createdAt: fixedDate,
			updatedAt: fixedDate,
			profile: profileEntity,
		});

		mockUserRepository.findById.mockResolvedValue(userEntity);

		const result = await useCase.execute("user-123");

		expect(mockUserRepository.findById).toHaveBeenCalledWith("user-123");
		expect(result).toEqual({
			id: "user-123",
			first_name: "Rahul",
			last_name: "Sharma",
			full_name: "Rahul Sharma",
			email: "rahul.sharma@example.com",
			phone: "+919876543210",
			status: "ACTIVE",
			avatar_url: "https://cdn.spotq.com/avatars/user-123.jpg",
			gender: "MALE",
			dob: "1995-06-20",
			location: "Kochi, Kerala",
			default_address: null,
			created_at: fixedDate.toISOString(),
			updated_at: fixedDate.toISOString(),
		});
	});

	it("should handle single word names without crashing and set last_name to null", async () => {
		const fixedDate = new Date("2026-01-15T10:00:00.000Z");

		const userEntity = UserEntity.reconstitute({
			id: "user-456",
			fullName: FullName.create("Ajex"),
			phone: null,
			email: Email.create("ajex@example.com"),
			passwordHash: "hashed_password",
			googleId: null,
			status: UserStatus.ACTIVE,
			isEmailVerified: true,
			createdAt: fixedDate,
			updatedAt: fixedDate,
			profile: null,
		});

		mockUserRepository.findById.mockResolvedValue(userEntity);

		const result = await useCase.execute("user-456");

		expect(result.first_name).toBe("Ajex");
		expect(result.last_name).toBeNull();
		expect(result.full_name).toBe("Ajex");
		expect(result.phone).toBeNull();
		expect(result.avatar_url).toBeNull();
		expect(result.dob).toBeNull();
		expect(result.gender).toBeNull();
		expect(result.location).toBeNull();
		expect(result.default_address).toBeNull();
	});

	it("should throw UserNotFoundError when user does not exist in repository", async () => {
		mockUserRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute("non-existent-id")).rejects.toThrow(
			UserNotFoundError,
		);
		expect(mockUserRepository.findById).toHaveBeenCalledWith("non-existent-id");
	});
});
