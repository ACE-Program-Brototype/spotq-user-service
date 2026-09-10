import { UpdateCustomerStatusUseCase } from "@application/use-cases/admin/update-customer-status.use-case.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import { UserNotFoundError } from "@domain/errors/domain.error.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";

describe("UpdateCustomerStatusUseCase", () => {
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let useCase: UpdateCustomerStatusUseCase;

	const fixedDate = new Date("2026-03-01T10:00:00.000Z");
	const updatedDate = new Date("2026-03-01T12:00:00.000Z");

	const activeUser = UserEntity.reconstitute({
		id: "usr_01HX8Z9Q7K",
		fullName: FullName.create("Alice Walker"),
		phone: PhoneNumber.create("+919876543210"),
		email: Email.create("alice@example.com"),
		passwordHash: "hash-secret-password",
		googleId: null,
		status: UserStatus.ACTIVE,
		isEmailVerified: true,
		createdAt: fixedDate,
		updatedAt: fixedDate,
	});

	const blockedUser = UserEntity.reconstitute({
		id: "usr_01HX8Z9Q7K",
		fullName: FullName.create("Alice Walker"),
		phone: PhoneNumber.create("+919876543210"),
		email: Email.create("alice@example.com"),
		passwordHash: "hash-secret-password",
		googleId: null,
		status: UserStatus.BLOCKED,
		isEmailVerified: true,
		createdAt: fixedDate,
		updatedAt: updatedDate,
	});

	beforeEach(() => {
		mockUserRepository = {
			findByEmail: jest.fn(),
			findByPhone: jest.fn(),
			findByGoogleId: jest.fn(),
			findById: jest.fn(),
			createWithSession: jest.fn(),
			updateProfile: jest.fn(),
			findCustomers: jest.fn(),
			countCustomers: jest.fn(),
			updateStatus: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
			findAll: jest.fn(),
			exists: jest.fn(),
		};

		useCase = new UpdateCustomerStatusUseCase(mockUserRepository);
	});

	it("should block an active customer and return safe response with id, status, and updatedAt", async () => {
		mockUserRepository.findById.mockResolvedValue(activeUser);
		mockUserRepository.updateStatus.mockResolvedValue(blockedUser);

		const result = await useCase.execute({
			userId: "usr_01HX8Z9Q7K",
			status: UserStatus.BLOCKED,
		});

		expect(mockUserRepository.findById).toHaveBeenCalledWith("usr_01HX8Z9Q7K");
		expect(mockUserRepository.updateStatus).toHaveBeenCalledWith(
			"usr_01HX8Z9Q7K",
			UserStatus.BLOCKED,
		);
		expect(result).toEqual({
			id: "usr_01HX8Z9Q7K",
			status: UserStatus.BLOCKED,
			updatedAt: updatedDate.toISOString(),
		});
		expect(result).not.toHaveProperty("passwordHash");
		expect(result).not.toHaveProperty("password");
	});

	it("should unblock a blocked customer and return active status", async () => {
		mockUserRepository.findById.mockResolvedValue(blockedUser);
		mockUserRepository.updateStatus.mockResolvedValue(activeUser);

		const result = await useCase.execute({
			userId: "usr_01HX8Z9Q7K",
			status: UserStatus.ACTIVE,
		});

		expect(mockUserRepository.findById).toHaveBeenCalledWith("usr_01HX8Z9Q7K");
		expect(mockUserRepository.updateStatus).toHaveBeenCalledWith(
			"usr_01HX8Z9Q7K",
			UserStatus.ACTIVE,
		);
		expect(result).toEqual({
			id: "usr_01HX8Z9Q7K",
			status: UserStatus.ACTIVE,
			updatedAt: fixedDate.toISOString(),
		});
	});

	it("should handle same-status update safely without re-updating in repository", async () => {
		mockUserRepository.findById.mockResolvedValue(activeUser);

		const result = await useCase.execute({
			userId: "usr_01HX8Z9Q7K",
			status: UserStatus.ACTIVE,
		});

		expect(mockUserRepository.findById).toHaveBeenCalledWith("usr_01HX8Z9Q7K");
		expect(mockUserRepository.updateStatus).not.toHaveBeenCalled();
		expect(result).toEqual({
			id: "usr_01HX8Z9Q7K",
			status: UserStatus.ACTIVE,
			updatedAt: fixedDate.toISOString(),
		});
	});

	it("should throw UserNotFoundError when customer does not exist", async () => {
		mockUserRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({
				userId: "usr_nonexistent",
				status: UserStatus.BLOCKED,
			}),
		).rejects.toThrow(UserNotFoundError);

		expect(mockUserRepository.updateStatus).not.toHaveBeenCalled();
	});
});
