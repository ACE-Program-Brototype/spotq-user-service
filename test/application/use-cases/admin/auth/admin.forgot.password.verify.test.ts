import { VerifyForgotPasswordEmailUseCase } from "@application/use-cases/admin/auth/verify.email.forgot-password.ts";
import { generateTempToken } from "@infrastructure/services/token.ts";

jest.mock("@infrastructure/services/token.ts", () => ({
	generateTempToken: jest.fn(),
}));

describe("VerifyForgotPasswordEmailUseCase", () => {
	let useCase: VerifyForgotPasswordEmailUseCase;

	const mockAdminAuthRepository = {
		findByEmail: jest.fn(),
	};

	const mockOtpService = {
		generateAndStoreOtp: jest.fn(),
		verifyOtp: jest.fn(),
		invalidateOtp: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();

		useCase = new VerifyForgotPasswordEmailUseCase(
			mockAdminAuthRepository as any,
			mockOtpService as any,
		);
	});

	it("should verify OTP and return temporary token", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "hashed-password",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		mockAdminAuthRepository.findByEmail.mockResolvedValue(admin);

		mockOtpService.verifyOtp.mockResolvedValue(true);

		(generateTempToken as jest.Mock).mockReturnValue("temporary-token-123");

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

		expect(generateTempToken).toHaveBeenCalledTimes(1);

		expect(generateTempToken).toHaveBeenCalledWith({
			userId: "admin-123",
			role: "admin",
		});
	});

	it("should throw USER_NOT_FOUND when admin does not exist", async () => {
		mockAdminAuthRepository.findByEmail.mockResolvedValue(null);

		await expect(
			useCase.execute("unknown@test.com", "123456"),
		).rejects.toThrow();

		expect(mockAdminAuthRepository.findByEmail).toHaveBeenCalledWith(
			"unknown@test.com",
		);

		expect(mockOtpService.verifyOtp).not.toHaveBeenCalled();

		expect(generateTempToken).not.toHaveBeenCalled();
	});

	it("should propagate OTP verification error", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "hashed-password",
			createdAt: new Date(),
			updatedAt: new Date(),
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

		expect(generateTempToken).not.toHaveBeenCalled();
	});

	it("should not generate token when OTP verification fails", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "hashed-password",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		mockAdminAuthRepository.findByEmail.mockResolvedValue(admin);

		mockOtpService.verifyOtp.mockRejectedValue(new Error("OTP is invalid"));

		await expect(useCase.execute("admin@test.com", "999999")).rejects.toThrow(
			"OTP is invalid",
		);

		expect(generateTempToken).not.toHaveBeenCalled();
	});
});
