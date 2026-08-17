import { AdminLoginUseCase } from "@application/use-cases/admin/auth/admin.login";
import { verifyPassword } from "@infrastructure/services/password";
import {
	generateAccessToken,
	generateRefreshToken,
} from "@infrastructure/services/token";

jest.mock("@infrastructure/services/password", () => ({
	verifyPassword: jest.fn(),
}));

jest.mock("@infrastructure/services/token", () => ({
	generateAccessToken: jest.fn(),
	generateRefreshToken: jest.fn(),
}));

const mockRepository = {
	findByEmail: jest.fn(),
	find: jest.fn(),
	findById: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
};

describe("AdminLoginUseCase", () => {
	const useCase = new AdminLoginUseCase(mockRepository);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should login admin successfully", async () => {
		mockRepository.findByEmail.mockResolvedValue({
			id: "admin-123",
			name: "Admin",
			email: "admin@example.com",
			passwordHash: "hashed-password",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		});

		(verifyPassword as jest.Mock).mockResolvedValue(true);

		(generateAccessToken as jest.Mock).mockReturnValue("access-token");

		(generateRefreshToken as jest.Mock).mockReturnValue("refresh-token");

		const result = await useCase.execute("admin@example.com", "password123");

		expect(result).toEqual({
			user: {
				_id: "admin-123",
				name: "Admin",
				email: "admin@example.com",
				created_at: new Date("2026-01-01"),
			},
			access_token: "access-token",
			refresh_token: "refresh-token",
		});

		expect(mockRepository.findByEmail).toHaveBeenCalledWith(
			"admin@example.com",
		);

		expect(verifyPassword).toHaveBeenCalledWith(
			"password123",
			"hashed-password",
		);

		expect(generateAccessToken).toHaveBeenCalledWith({
			userId: "admin-123",
			role: "admin",
		});

		expect(generateRefreshToken).toHaveBeenCalledWith({
			userId: "admin-123",
			role: "admin",
		});
	});

	it("should throw error when admin does not exist", async () => {
		mockRepository.findByEmail.mockResolvedValue(null);

		await expect(
			useCase.execute("unknown@example.com", "password123"),
		).rejects.toThrow("User not found");

		expect(mockRepository.findByEmail).toHaveBeenCalledWith(
			"unknown@example.com",
		);

		expect(verifyPassword).not.toHaveBeenCalled();

		expect(generateAccessToken).not.toHaveBeenCalled();

		expect(generateRefreshToken).not.toHaveBeenCalled();
	});

	it("should throw error when password is invalid", async () => {
		mockRepository.findByEmail.mockResolvedValue({
			id: "admin-123",
			name: "Admin",
			email: "admin@example.com",
			passwordHash: "hashed-password",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		});

		(verifyPassword as jest.Mock).mockResolvedValue(false);

		await expect(
			useCase.execute("admin@example.com", "wrong-password"),
		).rejects.toThrow("Invalid credentials");

		expect(mockRepository.findByEmail).toHaveBeenCalledWith(
			"admin@example.com",
		);

		expect(verifyPassword).toHaveBeenCalledWith(
			"wrong-password",
			"hashed-password",
		);

		expect(generateAccessToken).not.toHaveBeenCalled();

		expect(generateRefreshToken).not.toHaveBeenCalled();
	});

	it("should propagate repository errors", async () => {
		const databaseError = new Error("Database unavailable");

		mockRepository.findByEmail.mockRejectedValue(databaseError);

		await expect(
			useCase.execute("admin@example.com", "password123"),
		).rejects.toThrow("Database unavailable");

		expect(mockRepository.findByEmail).toHaveBeenCalledWith(
			"admin@example.com",
		);

		expect(verifyPassword).not.toHaveBeenCalled();

		expect(generateAccessToken).not.toHaveBeenCalled();

		expect(generateRefreshToken).not.toHaveBeenCalled();
	});
});
