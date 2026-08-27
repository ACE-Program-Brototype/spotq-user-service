import type { IOtpService, ITokenService } from "@application/ports/services";
import { CustomerVerifyForgotPasswordUseCase } from "@application/use-cases/customer.verify.forgot-password";
import { UserEntity } from "@domain/entities";
import { UserNotFoundError } from "@domain/errors";
import type { IUserRepository } from "@domain/repositories";
import { Email, FullName, PhoneNumber } from "@domain/value-objects";

describe("CustomerVerifyForgotPasswordUseCase", () => {
	const mockUserRepository: jest.Mocked<IUserRepository> = {
		findByEmail: jest.fn(),
		findById: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
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

	let useCase: CustomerVerifyForgotPasswordUseCase;

	const createUser = (): UserEntity => {
		return UserEntity.create({
			id: "user-123",
			fullName: new FullName("Test Customer"),
			email: new Email("customer@test.com"),
			phoneNumber: new PhoneNumber("+919876543210"),
			passwordHash: "old-password-hash",
		});
	};

	beforeEach(() => {
		jest.clearAllMocks();

		useCase = new CustomerVerifyForgotPasswordUseCase(
			mockUserRepository,
			mockOtpService,
			mockTokenService,
		);
	});

	it("should verify OTP and return temp token", async () => {
		const email = "customer@test.com";
		const otp = "123456";
		const tempToken = "temp-token-123";

		const user = createUser();

		mockUserRepository.findByEmail.mockResolvedValue(user);
		mockOtpService.verifyOtp.mockResolvedValue(true);
		mockTokenService.generateTempToken.mockReturnValue(tempToken);

		const result = await useCase.execute(email, otp);

		expect(result).toBe(tempToken);

		expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);

		expect(mockOtpService.verifyOtp).toHaveBeenCalledWith(email, otp);

		expect(mockTokenService.generateTempToken).toHaveBeenCalledWith({
			userId: user.id,
			role: "customer",
		});
	});

	it("should throw UserNotFoundError when user does not exist", async () => {
		const email = "unknown@test.com";
		const otp = "123456";

		mockUserRepository.findByEmail.mockResolvedValue(null);

		await expect(useCase.execute(email, otp)).rejects.toThrow(
			UserNotFoundError,
		);

		expect(mockOtpService.verifyOtp).not.toHaveBeenCalled();

		expect(mockTokenService.generateTempToken).not.toHaveBeenCalled();
	});

	it("should propagate error when OTP verification fails", async () => {
		const email = "customer@test.com";
		const otp = "999999";

		const user = createUser();

		mockUserRepository.findByEmail.mockResolvedValue(user);

		mockOtpService.verifyOtp.mockRejectedValue(new Error("Invalid OTP"));

		await expect(useCase.execute(email, otp)).rejects.toThrow("Invalid OTP");

		expect(mockTokenService.generateTempToken).not.toHaveBeenCalled();
	});

	it("should propagate error when OTP is expired", async () => {
		const user = createUser();

		mockUserRepository.findByEmail.mockResolvedValue(user);

		mockOtpService.verifyOtp.mockRejectedValue(new Error("OTP expired"));

		await expect(
			useCase.execute("customer@test.com", "123456"),
		).rejects.toThrow("OTP expired");

		expect(mockTokenService.generateTempToken).not.toHaveBeenCalled();
	});

	it("should propagate error when temp token generation fails", async () => {
		const user = createUser();

		mockUserRepository.findByEmail.mockResolvedValue(user);
		mockOtpService.verifyOtp.mockResolvedValue(true);

		mockTokenService.generateTempToken.mockImplementation(() => {
			throw new Error("Token generation failed");
		});

		await expect(
			useCase.execute("customer@test.com", "123456"),
		).rejects.toThrow("Token generation failed");
	});
});
