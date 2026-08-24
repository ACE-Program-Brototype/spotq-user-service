import type { IAdminTokenService } from "@application/ports/services/index.ts";
import { AdminLogoutUseCase } from "@application/use-cases/admin/auth/admin.logout";

describe("AdminLogoutUseCase", () => {
	const mockRefreshTokenRepository = {
		revoke: jest.fn(),
		isRevoked: jest.fn(),
	};

	const mockTokenService: jest.Mocked<IAdminTokenService> = {
		generateAccessToken: jest.fn(),
		generateRefreshToken: jest.fn(),
		generateTempToken: jest.fn(),
		verifyAccessToken: jest.fn(),
		verifyRefreshToken: jest.fn(),
		verifyTempToken: jest.fn(),
		getTokenTTL: jest.fn(),
		hashToken: jest.fn(),
	};

	let useCase: AdminLogoutUseCase;

	beforeEach(() => {
		jest.clearAllMocks();

		useCase = new AdminLogoutUseCase(
			mockRefreshTokenRepository,
			mockTokenService,
		);
	});

	it("should revoke a valid refresh token", async () => {
		mockTokenService.getTokenTTL.mockReturnValue(3600);
		mockRefreshTokenRepository.revoke.mockResolvedValue(undefined);

		await expect(
			useCase.execute("valid-refresh-token"),
		).resolves.toBeUndefined();

		expect(mockTokenService.getTokenTTL).toHaveBeenCalledTimes(1);
		expect(mockTokenService.getTokenTTL).toHaveBeenCalledWith(
			"valid-refresh-token",
		);

		expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledTimes(1);
		expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledWith(
			"valid-refresh-token",
			3600,
		);
	});

	it("should not revoke an expired refresh token", async () => {
		mockTokenService.getTokenTTL.mockReturnValue(0);

		await expect(
			useCase.execute("expired-refresh-token"),
		).resolves.toBeUndefined();

		expect(mockTokenService.getTokenTTL).toHaveBeenCalledWith(
			"expired-refresh-token",
		);

		expect(mockRefreshTokenRepository.revoke).not.toHaveBeenCalled();
	});

	it("should not revoke a token when TTL is negative", async () => {
		mockTokenService.getTokenTTL.mockReturnValue(-1);

		await expect(
			useCase.execute("expired-refresh-token"),
		).resolves.toBeUndefined();

		expect(mockRefreshTokenRepository.revoke).not.toHaveBeenCalled();
	});

	it("should propagate repository errors", async () => {
		mockTokenService.getTokenTTL.mockReturnValue(3600);

		mockRefreshTokenRepository.revoke.mockRejectedValue(
			new Error("Redis unavailable"),
		);

		await expect(useCase.execute("valid-refresh-token")).rejects.toThrow(
			"Redis unavailable",
		);

		expect(mockTokenService.getTokenTTL).toHaveBeenCalledWith(
			"valid-refresh-token",
		);

		expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledWith(
			"valid-refresh-token",
			3600,
		);
	});
});
