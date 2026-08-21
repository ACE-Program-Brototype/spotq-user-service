import type { IPasswordHasher } from "@application/ports/service/IPassword.service";
import { AdminResetPasswordUseCase } from "@application/use-cases/admin/auth/admin.reset.password";
import type { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";

describe("AdminResetPasswordUseCase", () => {
	const mockAdminRepository: jest.Mocked<IAdminAuthRepository> = {
		find: jest.fn(),
		findById: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		findByEmail: jest.fn(),
	};

	const mockPasswordHasher: jest.Mocked<IPasswordHasher> = {
		hashPassword: jest.fn(),
		verifyPassword: jest.fn(),
	};

	let useCase: AdminResetPasswordUseCase;

	beforeEach(() => {
		jest.clearAllMocks();

		useCase = new AdminResetPasswordUseCase(
			mockAdminRepository,
			mockPasswordHasher,
		);
	});

	it("should reset password successfully", async () => {
		const createdAt = new Date("2026-01-01");
		const updatedAt = new Date("2026-08-19");

		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "old-password-hash",
			createdAt,
			updatedAt: createdAt,
		};

		const updatedAdmin = {
			...admin,
			passwordHash: "new-password-hash",
			updatedAt,
		};

		mockAdminRepository.findById.mockResolvedValue(admin);

		mockPasswordHasher.hashPassword.mockResolvedValue("new-password-hash");

		mockAdminRepository.update.mockResolvedValue(updatedAdmin);

		const result = await useCase.execute("admin-123", "NewPassword123");

		expect(result).toEqual({
			_id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			created_at: createdAt,
		});

		expect(mockAdminRepository.findById).toHaveBeenCalledWith("admin-123");

		expect(mockPasswordHasher.hashPassword).toHaveBeenCalledWith(
			"NewPassword123",
		);

		expect(mockAdminRepository.update).toHaveBeenCalledWith("admin-123", {
			passwordHash: "new-password-hash",
		});
	});

	it("should throw USER_NOT_FOUND when admin does not exist", async () => {
		mockAdminRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute("unknown-admin", "NewPassword123"),
		).rejects.toThrow();

		expect(mockAdminRepository.findById).toHaveBeenCalledWith("unknown-admin");

		expect(mockPasswordHasher.hashPassword).not.toHaveBeenCalled();

		expect(mockAdminRepository.update).not.toHaveBeenCalled();
	});

	it("should throw RESET_PASSWORD_FAILED when update returns null", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "old-password-hash",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		};

		mockAdminRepository.findById.mockResolvedValue(admin);

		mockPasswordHasher.hashPassword.mockResolvedValue("new-password-hash");

		mockAdminRepository.update.mockResolvedValue(null);

		await expect(
			useCase.execute("admin-123", "NewPassword123"),
		).rejects.toThrow();

		expect(mockAdminRepository.findById).toHaveBeenCalledWith("admin-123");

		expect(mockPasswordHasher.hashPassword).toHaveBeenCalledWith(
			"NewPassword123",
		);

		expect(mockAdminRepository.update).toHaveBeenCalledWith("admin-123", {
			passwordHash: "new-password-hash",
		});
	});

	it("should propagate password hashing errors", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "old-password-hash",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		};

		mockAdminRepository.findById.mockResolvedValue(admin);

		mockPasswordHasher.hashPassword.mockRejectedValue(
			new Error("Hashing failed"),
		);

		await expect(
			useCase.execute("admin-123", "NewPassword123"),
		).rejects.toThrow("Hashing failed");

		expect(mockAdminRepository.findById).toHaveBeenCalledWith("admin-123");

		expect(mockPasswordHasher.hashPassword).toHaveBeenCalledWith(
			"NewPassword123",
		);

		expect(mockAdminRepository.update).not.toHaveBeenCalled();
	});
});
