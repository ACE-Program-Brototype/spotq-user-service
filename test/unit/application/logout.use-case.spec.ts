import type { ITokenService, ILogger } from "@application/ports/services/index.ts";
import { LogoutUseCase } from "@application/use-cases/logout.use-case.ts";
import type { IRefreshTokenRepository } from "@domain/repositories/refresh-token.repository.interface.ts";

describe("LogoutUseCase", () => {
	let mockRefreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;
	let mockTokenService: jest.Mocked<ITokenService>;
	let mockLogger: jest.Mocked<ILogger>;
	let useCase: LogoutUseCase;

	beforeEach(() => {
		mockRefreshTokenRepository = {
			save: jest.fn(),
			findByTokenHash: jest.fn(),
			revoke: jest.fn().mockResolvedValue(undefined),
			revokeAllForUser: jest.fn(),
		};

		mockTokenService = {
			generateAccessToken: jest.fn(),
			generateRefreshToken: jest.fn(),
			hashToken: jest.fn().mockReturnValue("hashed_refresh_token"),
			verifyAccessToken: jest.fn(),
		};

		mockLogger = {
			info: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
		};

		useCase = new LogoutUseCase(mockRefreshTokenRepository, mockTokenService, mockLogger);
	});

	it("should revoke the refresh token hash and return success", async () => {
		const result = await useCase.execute({
			userId: "user-123",
			refreshToken: "plain_refresh_token",
		});

		expect(result.success).toBe(true);
		expect(result.message).toBe("Logged out successfully.");
		expect(mockTokenService.hashToken).toHaveBeenCalledWith(
			"plain_refresh_token",
		);
		expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledWith(
			"hashed_refresh_token",
			expect.any(Date),
		);
	});

	it("should be idempotent when no refreshToken is provided", async () => {
		const result = await useCase.execute({
			userId: "user-123",
			refreshToken: "",
		});

		expect(result.success).toBe(true);
		expect(mockRefreshTokenRepository.revoke).not.toHaveBeenCalled();
	});
});
