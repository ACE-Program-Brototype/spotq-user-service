import type { IPasswordHasher } from "@application/ports/service/IPassword.service";
import type { ITokenService } from "@application/ports/service/IToken.service";
import { AdminLoginUseCase } from "@application/use-cases/admin/auth/admin.login";

describe("AdminLoginUseCase", () => {
	const mockRepository = {
		findByEmail: jest.fn(),
		find: jest.fn(),
		findById: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
	};

	const mockPasswordHasher: jest.Mocked<IPasswordHasher> = {
		hashPassword: jest.fn(),
		verifyPassword: jest.fn(),
	};

	const mockTokenService: jest.Mocked<ITokenService> = {
		generateAccessToken: jest.fn(),
		generateRefreshToken: jest.fn(),
		getTokenTTL: jest.fn(),
		hashRefreshToken: jest.fn(),
	};

	const useCase = new AdminLoginUseCase(
		mockRepository,
		mockPasswordHasher,
		mockTokenService,
	);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should login admin successfully", async () => {
		const admin = {
			id: "admin-123",
			name: "Admin",
			email: "admin@example.com",
			passwordHash: "hashed-password",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		};

		mockRepository.findByEmail.mockResolvedValue(admin);

		mockPasswordHasher.verifyPassword.mockResolvedValue(true);

		mockTokenService.generateAccessToken.mockReturnValue("access-token");

		mockTokenService.generateRefreshToken.mockReturnValue("refresh-token");

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

		expect(mockPasswordHasher.verifyPassword).toHaveBeenCalledWith(
			"password123",
			"hashed-password",
		);

		expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith({
			userId: "admin-123",
			role: "admin",
		});

		expect(mockTokenService.generateRefreshToken).toHaveBeenCalledWith({
			userId: "admin-123",
			role: "admin",
		});
	});

	it("should throw error when admin does not exist", async () => {
		mockRepository.findByEmail.mockResolvedValue(null);

		await expect(
			useCase.execute("unknown@example.com", "password123"),
		).rejects.toThrow("Invalid email or password");

		expect(mockRepository.findByEmail).toHaveBeenCalledWith(
			"unknown@example.com",
		);

		expect(mockPasswordHasher.verifyPassword).not.toHaveBeenCalled();

		expect(mockTokenService.generateAccessToken).not.toHaveBeenCalled();

		expect(mockTokenService.generateRefreshToken).not.toHaveBeenCalled();
	});

	it("should throw error when password is invalid", async () => {
		const admin = {
			id: "admin-123",
			name: "Admin",
			email: "admin@example.com",
			passwordHash: "hashed-password",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		};

		mockRepository.findByEmail.mockResolvedValue(admin);

		mockPasswordHasher.verifyPassword.mockResolvedValue(false);

		await expect(
			useCase.execute("admin@example.com", "wrong-password"),
		).rejects.toThrow("Invalid email or password");

		expect(mockRepository.findByEmail).toHaveBeenCalledWith(
			"admin@example.com",
		);

		expect(mockPasswordHasher.verifyPassword).toHaveBeenCalledWith(
			"wrong-password",
			"hashed-password",
		);

		expect(mockTokenService.generateAccessToken).not.toHaveBeenCalled();

		expect(mockTokenService.generateRefreshToken).not.toHaveBeenCalled();
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

		expect(mockPasswordHasher.verifyPassword).not.toHaveBeenCalled();

		expect(mockTokenService.generateAccessToken).not.toHaveBeenCalled();

		expect(mockTokenService.generateRefreshToken).not.toHaveBeenCalled();
	});
});
