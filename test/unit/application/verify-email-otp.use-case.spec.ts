import type {
	ILogger,
	IOtpService,
} from "@application/ports/services/index.ts";
import { VerifyEmailOtpUseCase } from "@application/use-cases/verify-email-otp.use-case.ts";
import { InvalidOtpError } from "@domain/errors/domain.error.ts";

describe("VerifyEmailOtpUseCase", () => {
	let mockOtpService: jest.Mocked<IOtpService>;
	let mockLogger: jest.Mocked<ILogger>;
	let useCase: VerifyEmailOtpUseCase;

	beforeEach(() => {
		mockOtpService = {
			generateAndStoreOtp: jest.fn(),
			verifyOtp: jest.fn(),
			invalidateOtp: jest.fn(),
		};

		mockLogger = {
			info: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
		};

		useCase = new VerifyEmailOtpUseCase(mockOtpService, mockLogger);
	});

	it("should verify OTP successfully", async () => {
		mockOtpService.verifyOtp.mockResolvedValue(true);

		const result = await useCase.execute({
			email: "john.doe@example.com",
			otp: "123456",
		});

		expect(result.success).toBe(true);
		expect(result.message).toBe("Email verified successfully.");
		expect(mockOtpService.verifyOtp).toHaveBeenCalledWith(
			"john.doe@example.com",
			"123456",
		);
	});

	it("should throw InvalidOtpError for non-6-digit OTPs", async () => {
		await expect(
			useCase.execute({
				email: "john.doe@example.com",
				otp: "12345",
			}),
		).rejects.toThrow(InvalidOtpError);

		await expect(
			useCase.execute({
				email: "john.doe@example.com",
				otp: "abcdef",
			}),
		).rejects.toThrow(InvalidOtpError);

		expect(mockOtpService.verifyOtp).not.toHaveBeenCalled();
	});
});
