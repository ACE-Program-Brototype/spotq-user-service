import type { ITokenService } from "@application/ports/service/IToken.service";
import { VerifyForgotPasswordEmailUseCase } from "@application/use-cases/admin/auth/verify.email.forgot-password";
import type { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";
import type { IOtpService } from "@domain/repository/shared/IOtp.service";

describe("VerifyForgotPasswordEmailUseCase", () => {
	const mockAdminAuthRepository: jest.Mocked<IAdminAuthRepository> = {
		find: jest.fn(),
		findById: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		findByEmail: jest.fn(),
	};

	const mockOtpService: jest.Mocked<IOtpService> = {
		generateAndStoreOtp: jest.fn(),
		verifyOtp: jest.fn(),
		invalidateOtp: jest.fn(),
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

	let useCase: VerifyForgotPasswordEmailUseCase;

	beforeEach(() => {
		jest.clearAllMocks();

		useCase = new VerifyForgotPasswordEmailUseCase(
			mockAdminAuthRepository,
			mockOtpService,
			mockTokenService,
		);
	});

	it("should verify OTP and return temporary token", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "hashed-password",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		};

		mockAdminAuthRepository.findByEmail.mockResolvedValue(admin);

		mockOtpService.verifyOtp.mockResolvedValue(true);

		mockTokenService.generateTempToken.mockReturnValue("temporary-token-123");

		const result = await useCase.execute("admin@test.com", "123456");

		expect(result).toBe("temporary-token-123");

		expect(mockAdminAuthRepository.findByEmail).toHaveBeenCalledTimes(1);

		expect(mockAdminAuthRepository.findByEmail).toHaveBeenCalledWith(
			"admin@test.com",
		);

		expect(mockOtpService.verifyOtp).toHaveBeenCalledTimes(1);

		expect(mockOtpService.verifyOtp).toHaveBeenCalledWith(
			"admin@test.com",
			"123456",
		);

		expect(mockTokenService.generateTempToken).toHaveBeenCalledTimes(1);

		expect(mockTokenService.generateTempToken).toHaveBeenCalledWith({
			userId: "admin-123",
			role: "admin",
		});
	});

	it("should throw when admin does not exist", async () => {
		mockAdminAuthRepository.findByEmail.mockResolvedValue(null);

		await expect(useCase.execute("unknown@test.com", "123456")).rejects.toThrow(
			"Invalid credentials",
		);

		expect(mockAdminAuthRepository.findByEmail).toHaveBeenCalledWith(
			"unknown@test.com",
		);

		expect(mockOtpService.verifyOtp).not.toHaveBeenCalled();

		expect(mockTokenService.generateTempToken).not.toHaveBeenCalled();
	});

	it("should propagate OTP verification errors", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "hashed-password",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		};

		mockAdminAuthRepository.findByEmail.mockResolvedValue(admin);

		mockOtpService.verifyOtp.mockRejectedValue(new Error("OTP is invalid"));

		await expect(useCase.execute("admin@test.com", "999999")).rejects.toThrow(
			"OTP is invalid",
		);

		expect(mockAdminAuthRepository.findByEmail).toHaveBeenCalledWith(
			"admin@test.com",
		);

		expect(mockOtpService.verifyOtp).toHaveBeenCalledWith(
			"admin@test.com",
			"999999",
		);

		expect(mockTokenService.generateTempToken).not.toHaveBeenCalled();
	});

	it("should generate token after successful OTP verification", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "hashed-password",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		};

		mockAdminAuthRepository.findByEmail.mockResolvedValue(admin);

		mockOtpService.verifyOtp.mockResolvedValue(true);

		mockTokenService.generateTempToken.mockReturnValue("temporary-token-123");

		await useCase.execute("admin@test.com", "123456");

		expect(mockTokenService.generateTempToken).toHaveBeenCalledWith({
			userId: "admin-123",
			role: "admin",
		});
	});
});
