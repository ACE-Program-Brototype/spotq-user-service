import type { ITokenService } from "@application/ports/services/index.ts";
import { AdminRefreshTokenUseCase } from "@application/use-cases/admin/auth/admin.refresh-token";
import type { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";
import type { IRefreshTokenRepository } from "@domain/repository/shared/IToken.repo";

describe("AdminRefreshTokenUseCase", () => {
	const mockAdminRepository: jest.Mocked<IAdminAuthRepository> = {
		find: jest.fn(),
		findById: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		findByEmail: jest.fn(),
	};

	const mockRefreshTokenRepository: jest.Mocked<IRefreshTokenRepository> = {
		revoke: jest.fn(),
		isRevoked: jest.fn(),
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

	let useCase: AdminRefreshTokenUseCase;

	beforeEach(() => {
		jest.clearAllMocks();

		useCase = new AdminRefreshTokenUseCase(
			mockAdminRepository,
			mockRefreshTokenRepository,
			mockTokenService,
		);
	});

	it("should refresh admin token successfully and rotate refresh token", async () => {
		const createdAt = new Date("2026-01-01");
		const updatedAt = new Date("2026-01-01");

		const admin = {
			id: "admin-123",
			name: "Super Admin",
			email: "admin@example.com",
			passwordHash: "hashed-pw",
			createdAt,
			updatedAt,
		};

		mockRefreshTokenRepository.isRevoked.mockResolvedValue(false);
		mockTokenService.verifyRefreshToken.mockReturnValue({
			sub: "admin-123",
			email: "admin@example.com",
			role: "admin",
		});
		mockAdminRepository.findById.mockResolvedValue(admin);
		mockTokenService.getTokenTTL.mockReturnValue(3600);
		mockRefreshTokenRepository.revoke.mockResolvedValue(undefined);
		mockTokenService.generateAccessToken.mockReturnValue("new-access-token");
		mockTokenService.generateRefreshToken.mockReturnValue("new-refresh-token");

		const result = await useCase.execute("valid-refresh-token");

		expect(result).toEqual({
			user: {
				_id: "admin-123",
				name: "Super Admin",
				email: "admin@example.com",
				created_at: createdAt,
			},
			access_token: "new-access-token",
			refresh_token: "new-refresh-token",
		});

		expect(mockRefreshTokenRepository.isRevoked).toHaveBeenCalledWith(
			"valid-refresh-token",
		);
		expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith(
			"valid-refresh-token",
		);
		expect(mockAdminRepository.findById).toHaveBeenCalledWith("admin-123");
		expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledWith(
			"valid-refresh-token",
			3600,
		);
		expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith({
			sub: "admin-123",
			email: "admin@example.com",
			role: "admin",
		});
		expect(mockTokenService.generateRefreshToken).toHaveBeenCalledWith({
			sub: "admin-123",
			email: "admin@example.com",
			role: "admin",
		});
	});

	it("should throw error if refresh token is missing or empty", async () => {
		await expect(useCase.execute("")).rejects.toThrow("Refresh token missing");
		await expect(useCase.execute("   ")).rejects.toThrow(
			"Refresh token missing",
		);
	});

	it("should throw error if refresh token is revoked", async () => {
		mockRefreshTokenRepository.isRevoked.mockResolvedValue(true);

		await expect(useCase.execute("revoked-token")).rejects.toThrow(
			"Invalid refresh token",
		);
		expect(mockTokenService.verifyRefreshToken).not.toHaveBeenCalled();
	});

	it("should throw error if refresh token verification fails", async () => {
		mockRefreshTokenRepository.isRevoked.mockResolvedValue(false);
		mockTokenService.verifyRefreshToken.mockImplementation(() => {
			throw new Error("jwt expired");
		});

		await expect(useCase.execute("expired-token")).rejects.toThrow(
			"Invalid refresh token",
		);
	});

	it("should throw error if admin user is not found", async () => {
		mockRefreshTokenRepository.isRevoked.mockResolvedValue(false);
		mockTokenService.verifyRefreshToken.mockReturnValue({
			sub: "deleted-admin",
			email: "deleted@example.com",
		});
		mockAdminRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute("valid-token-deleted-user")).rejects.toThrow(
			"User not found",
		);
	});
});
