import type { IPasswordHasher } from "@application/ports/service/IPassword.service";
import type { ITokenService } from "@application/ports/service/IToken.service";
import { AdminLoginUseCase } from "@application/use-cases/admin/auth/admin.login";
import type { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";

describe("AdminLoginUseCase", () => {
	const mockRepository: jest.Mocked<IAdminAuthRepository> = {
		find: jest.fn(),
		findByEmail: jest.fn(),
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
		generateTempToken: jest.fn(),
		verifyAccessToken: jest.fn(),
		verifyRefreshToken: jest.fn(),
		verifyTempToken: jest.fn(),
		getTokenTTL: jest.fn(),
		hashToken: jest.fn(),
	};

	let useCase: AdminLoginUseCase;

	beforeEach(() => {
		jest.clearAllMocks();

		useCase = new AdminLoginUseCase(
			mockRepository,
			mockPasswordHasher,
			mockTokenService,
		);
	});

	it("should login admin successfully", async () => {
		const createdAt = new Date("2026-01-01");
		const updatedAt = new Date("2026-01-01");

		const admin = {
			id: "admin-123",
			name: "Admin",
			email: "admin@example.com",
			passwordHash: "hashed-password",
			createdAt,
			updatedAt,
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
				created_at: createdAt,
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

	it("should throw Invalid credentials when admin does not exist", async () => {
		mockRepository.findByEmail.mockResolvedValue(null);

		await expect(
			useCase.execute("unknown@example.com", "password123"),
		).rejects.toThrow("Invalid credentials");

		expect(mockRepository.findByEmail).toHaveBeenCalledWith(
			"unknown@example.com",
		);

		expect(mockPasswordHasher.verifyPassword).not.toHaveBeenCalled();

		expect(mockTokenService.generateAccessToken).not.toHaveBeenCalled();

		expect(mockTokenService.generateRefreshToken).not.toHaveBeenCalled();
	});

	it("should throw Invalid credentials when password is invalid", async () => {
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
		).rejects.toThrow("Invalid credentials");

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
		mockRepository.findByEmail.mockRejectedValue(
			new Error("Database unavailable"),
		);

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

	it("should propagate password verification errors", async () => {
		const admin = {
			id: "admin-123",
			name: "Admin",
			email: "admin@example.com",
			passwordHash: "hashed-password",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		};

		mockRepository.findByEmail.mockResolvedValue(admin);

		mockPasswordHasher.verifyPassword.mockRejectedValue(
			new Error("Password verification failed"),
		);

		await expect(
			useCase.execute("admin@example.com", "password123"),
		).rejects.toThrow("Password verification failed");

		expect(mockPasswordHasher.verifyPassword).toHaveBeenCalledWith(
			"password123",
			"hashed-password",
		);

		expect(mockTokenService.generateAccessToken).not.toHaveBeenCalled();

		expect(mockTokenService.generateRefreshToken).not.toHaveBeenCalled();
	});
});
