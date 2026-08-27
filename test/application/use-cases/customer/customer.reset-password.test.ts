import type { IPasswordHashService } from "@application/ports/services";
import { CustomerResetPasswordUseCase } from "@application/use-cases/customer.reset.password";
import { UserEntity } from "@domain/entities";
import { UserNotFoundError } from "@domain/errors";
import { ResetPasswordFailedError } from "@domain/errors/reset.password.error";
import type { IUserRepository } from "@domain/repositories";
import { Email, FullName, PhoneNumber } from "@domain/value-objects";

describe("CustomerResetPasswordUseCase", () => {
	const mockUserRepository: jest.Mocked<IUserRepository> = {
		findByEmail: jest.fn(),
		findById: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
	};

	const mockPasswordService: jest.Mocked<IPasswordHashService> = {
		hashPassword: jest.fn(),
		verifyPassword: jest.fn(),
	};

	let useCase: CustomerResetPasswordUseCase;

	const createUser = (): UserEntity => {
		return UserEntity.create({
			id: "user-123",
			fullName: new FullName("Test Customer"),
			email: new Email("customer@test.com"),
			phoneNumber: new PhoneNumber("+919876543210"),
			passwordHash: "old-password-hash",
		});
	};

	beforeEach(() => {
		jest.clearAllMocks();

		useCase = new CustomerResetPasswordUseCase(
			mockUserRepository,
			mockPasswordService,
		);
	});

	it("should reset password successfully", async () => {
		const userId = "user-123";
		const password = "NewPassword@123";
		const passwordHash = "new-password-hash";

		const user = createUser();

		mockUserRepository.findById.mockResolvedValue(user);
		mockPasswordService.hashPassword.mockResolvedValue(passwordHash);
		mockUserRepository.update.mockResolvedValue(user);

		await expect(useCase.execute(userId, password)).resolves.toBeUndefined();

		expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);

		expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(password);

		expect(mockUserRepository.update).toHaveBeenCalledWith(userId, user);
	});

	it("should throw UserNotFoundError when user does not exist", async () => {
		const userId = "unknown-user";
		const password = "NewPassword@123";

		mockUserRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(userId, password)).rejects.toThrow(
			UserNotFoundError,
		);

		expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();

		expect(mockUserRepository.update).not.toHaveBeenCalled();
	});

	it("should propagate error when password hashing fails", async () => {
		const userId = "user-123";
		const password = "NewPassword@123";

		const user = createUser();

		mockUserRepository.findById.mockResolvedValue(user);

		mockPasswordService.hashPassword.mockRejectedValue(
			new Error("Hashing failed"),
		);

		await expect(useCase.execute(userId, password)).rejects.toThrow(
			"Hashing failed",
		);

		expect(mockUserRepository.update).not.toHaveBeenCalled();
	});

	it("should throw ResetPasswordFailedError when repository update fails", async () => {
		const userId = "user-123";
		const password = "NewPassword@123";
		const passwordHash = "new-password-hash";

		const user = createUser();

		mockUserRepository.findById.mockResolvedValue(user);
		mockPasswordService.hashPassword.mockResolvedValue(passwordHash);
		mockUserRepository.update.mockResolvedValue(null);

		await expect(useCase.execute(userId, password)).rejects.toThrow(
			ResetPasswordFailedError,
		);

		expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(password);

		expect(mockUserRepository.update).toHaveBeenCalledWith(userId, user);
	});

	it("should hash the new password before updating the user", async () => {
		const userId = "user-123";
		const password = "NewPassword@123";
		const passwordHash = "secure-hash";

		const user = createUser();

		mockUserRepository.findById.mockResolvedValue(user);
		mockPasswordService.hashPassword.mockResolvedValue(passwordHash);
		mockUserRepository.update.mockResolvedValue(user);

		await useCase.execute(userId, password);

		expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(password);

		expect(mockUserRepository.update).toHaveBeenCalledWith(userId, user);
	});
});
