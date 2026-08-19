jest.mock("@infrastructure/services/password", () => ({
	hashPassword: jest.fn(),
}));

import { AdminResetPasswordUseCase } from "@application/use-cases/admin/auth/admin.reset.password";
import { hashPassword } from "@infrastructure/services/password";

const mockedHashPassword = jest.mocked(hashPassword);

describe("AdminResetPasswordUseCase", () => {
	const adminRepository = {
		findById: jest.fn(),
		update: jest.fn(),
	};

	let useCase: AdminResetPasswordUseCase;

	beforeEach(() => {
		jest.clearAllMocks();

		useCase = new AdminResetPasswordUseCase(adminRepository as any);
	});

	it("should reset password successfully", async () => {
		const oldPasswordHash = "old-password-hash";
		const newPasswordHash = "new-password-hash";

		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: oldPasswordHash,
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		};

		const updatedAdmin = {
			...admin,
			passwordHash: newPasswordHash,
			updatedAt: new Date("2026-08-19"),
		};

		adminRepository.findById.mockResolvedValue(admin);

		mockedHashPassword.mockResolvedValue(newPasswordHash);

		adminRepository.update.mockResolvedValue(updatedAdmin);

		const result = await useCase.execute("admin-123", "NewPassword123");

		expect(adminRepository.findById).toHaveBeenCalledWith("admin-123");

		expect(mockedHashPassword).toHaveBeenCalledWith("NewPassword123");

		expect(adminRepository.update).toHaveBeenCalledWith("admin-123", {
			passwordHash: newPasswordHash,
		});

		expect(result).toEqual({
			_id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			created_at: updatedAdmin.createdAt,
		});
	});

	it("should throw USER_NOT_FOUND when admin does not exist", async () => {
		adminRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute("unknown-admin", "NewPassword123"),
		).rejects.toThrow();

		expect(adminRepository.findById).toHaveBeenCalledWith("unknown-admin");

		expect(mockedHashPassword).not.toHaveBeenCalled();

		expect(adminRepository.update).not.toHaveBeenCalled();
	});

	it("should throw RESET_PASSWORD_FAILED when update returns null", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "old-hash",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		adminRepository.findById.mockResolvedValue(admin);

		mockedHashPassword.mockResolvedValue("new-hash");

		adminRepository.update.mockResolvedValue(null);

		await expect(
			useCase.execute("admin-123", "NewPassword123"),
		).rejects.toThrow();

		expect(adminRepository.findById).toHaveBeenCalledWith("admin-123");

		expect(mockedHashPassword).toHaveBeenCalledWith("NewPassword123");

		expect(adminRepository.update).toHaveBeenCalledWith("admin-123", {
			passwordHash: "new-hash",
		});
	});

	it("should propagate password hashing errors", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "old-hash",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		adminRepository.findById.mockResolvedValue(admin);

		mockedHashPassword.mockRejectedValue(new Error("Hashing failed"));

		await expect(
			useCase.execute("admin-123", "NewPassword123"),
		).rejects.toThrow("Hashing failed");

		expect(adminRepository.update).not.toHaveBeenCalled();
	});
});
