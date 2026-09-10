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
		};

		useCase = new GetCustomerProfileUseCase(mockUserRepository);
	});

	it("should retrieve complete customer profile when all fields are present", async () => {
		const fixedDate = new Date("2026-01-15T10:00:00.000Z");
		const birthDate = new Date("1995-06-20T00:00:00.000Z");

		const profileEntity = UserProfileEntity.reconstitute({
			id: "profile-123",
			userId: "user-123",
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
			full_name: "Rahul Sharma",
			email: "rahul.sharma@example.com",
			phone: "+919876543210",
			status: "ACTIVE",
			gender: "MALE",
			dob: "1995-06-20",
			location: "Kochi, Kerala",
			default_address: null,
			created_at: fixedDate.toISOString(),
			updated_at: fixedDate.toISOString(),
		});
	});

	it("should handle single word names without crashing", async () => {
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

		expect(result.full_name).toBe("Ajex");
		expect(result.phone).toBeNull();
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
