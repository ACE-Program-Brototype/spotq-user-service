import type { ITokenService } from "@application/ports/service/IToken.service";
import { AdminLogoutUseCase } from "@application/use-cases/admin/auth/admin.logout";

describe("AdminLogoutUseCase", () => {
	const mockRefreshTokenRepository = {
		revoke: jest.fn(),
		isRevoked: jest.fn(),
	};

	const mockTokenService: jest.Mocked<ITokenService> = {
		generateAccessToken: jest.fn(),
		generateRefreshToken: jest.fn(),
		getTokenTTL: jest.fn(),
		hashRefreshToken: jest.fn(),
	};

	const useCase = new AdminLogoutUseCase(
		mockRefreshTokenRepository,
		mockTokenService,
	);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should revoke a valid refresh token", async () => {
		mockTokenService.getTokenTTL.mockReturnValue(3600);

		await useCase.execute("valid-refresh-token");

		expect(mockTokenService.getTokenTTL).toHaveBeenCalledWith(
			"valid-refresh-token",
		);

		expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledWith(
			"valid-refresh-token",
			3600,
		);
	});

	it("should not revoke an expired refresh token", async () => {
		mockTokenService.getTokenTTL.mockReturnValue(0);

		await useCase.execute("expired-refresh-token");

		expect(mockTokenService.getTokenTTL).toHaveBeenCalledWith(
			"expired-refresh-token",
		);

		expect(mockRefreshTokenRepository.revoke).not.toHaveBeenCalled();
	});

	it("should propagate repository errors", async () => {
		const error = new Error("Redis unavailable");

		mockTokenService.getTokenTTL.mockReturnValue(3600);

		mockRefreshTokenRepository.revoke.mockRejectedValue(error);

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
