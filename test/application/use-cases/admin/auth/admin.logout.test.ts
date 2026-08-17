import { AdminLogoutUseCase } from "@application/use-cases/admin/auth/admin.logout";
import { getTokenTTL } from "@infrastructure/services/token";

jest.mock("@infrastructure/services/token", () => ({
	getTokenTTL: jest.fn(),
}));

const mockRefreshTokenRepository = {
	revoke: jest.fn(),
	isRevoked: jest.fn(),
};

describe("AdminLogoutUseCase", () => {
	const useCase = new AdminLogoutUseCase(mockRefreshTokenRepository);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should revoke a valid refresh token", async () => {
		(getTokenTTL as jest.Mock).mockReturnValue(3600);

		await useCase.execute("valid-refresh-token");

		expect(getTokenTTL).toHaveBeenCalledWith("valid-refresh-token");

		expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledWith(
			"valid-refresh-token",
			3600,
		);
	});

	it("should not revoke an expired refresh token", async () => {
		(getTokenTTL as jest.Mock).mockReturnValue(0);

		await useCase.execute("expired-refresh-token");

		expect(mockRefreshTokenRepository.revoke).not.toHaveBeenCalled();
	});

	it("should propagate repository errors", async () => {
		const error = new Error("Redis unavailable");

		(getTokenTTL as jest.Mock).mockReturnValue(3600);

		mockRefreshTokenRepository.revoke.mockRejectedValue(error);

		await expect(useCase.execute("valid-refresh-token")).rejects.toThrow(
			"Redis unavailable",
		);

		expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledWith(
			"valid-refresh-token",
			3600,
		);
	});
});
