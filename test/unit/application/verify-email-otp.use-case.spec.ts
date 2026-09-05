import type {
	IIdGenerator,
	ILogger,
	IOtpService,
} from "@application/ports/services/index.ts";
import type { ITokenService } from "@application/ports/services/token-service.interface.ts";
import { VerifyEmailOtpUseCase } from "@application/use-cases/verify-email-otp.use-case.ts";

import { UserEntity } from "@domain/entities/user.entity.ts";
import {
	InvalidOtpError,
	UserNotFoundError,
} from "@domain/errors/domain.error.ts";
import type {
	IDeviceRepository,
	IRefreshTokenRepository,
	IUserRepository,
} from "@domain/repositories/index.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";

describe("VerifyEmailOtpUseCase", () => {
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let mockDeviceRepository: jest.Mocked<IDeviceRepository>;
	let mockRefreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;
	let mockTokenService: jest.Mocked<ITokenService>;
	let mockOtpService: jest.Mocked<IOtpService>;
	let mockIdGenerator: jest.Mocked<IIdGenerator>;
	let mockLogger: jest.Mocked<ILogger>;
	let useCase: VerifyEmailOtpUseCase;

	beforeEach(() => {
		mockUserRepository = {
			findByEmail: jest.fn(),
			findByPhone: jest.fn(),
			findById: jest.fn(),
			findByGoogleId: jest.fn(),
			create: jest.fn(),
			createWithSession: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			find: jest.fn(),
		} as unknown as jest.Mocked<IUserRepository>;

		mockDeviceRepository = {
			findByUserIdAndPlatform: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			findById: jest.fn(),
			find: jest.fn(),
		} as unknown as jest.Mocked<IDeviceRepository>;

		mockRefreshTokenRepository = {
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			findById: jest.fn(),
			find: jest.fn(),
		} as unknown as jest.Mocked<IRefreshTokenRepository>;

		mockTokenService = {
			generateAccessToken: jest.fn().mockReturnValue("mock_access_token"),
			generateRefreshToken: jest.fn().mockReturnValue({
				token: "mock_refresh_token",
				tokenHash: "mock_token_hash",
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			}),
			hashToken: jest.fn(),
			verifyAccessToken: jest.fn(),
		} as unknown as jest.Mocked<ITokenService>;

		mockOtpService = {
			generateAndStoreOtp: jest.fn(),
			verifyOtp: jest.fn(),
			invalidateOtp: jest.fn(),
		} as unknown as jest.Mocked<IOtpService>;

		mockIdGenerator = {
			generateUuid: jest.fn().mockReturnValue("uuid-123"),
		} as unknown as jest.Mocked<IIdGenerator>;

		mockLogger = {
			info: jest.fn(),

			error: jest.fn(),
			warn: jest.fn(),
		} as unknown as jest.Mocked<ILogger>;

		useCase = new VerifyEmailOtpUseCase(
			mockUserRepository,
			mockDeviceRepository,
			mockRefreshTokenRepository,
			mockTokenService,
			mockOtpService,
			mockIdGenerator,
			mockLogger,
		);
	});

	it("should verify OTP successfully, generate session and return user with access and refresh tokens", async () => {
		mockOtpService.verifyOtp.mockResolvedValue(true);

		const fakeUser = UserEntity.create({
			id: "usr-123",
			fullName: FullName.create("John Doe"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("john.doe@example.com"),
			passwordHash: "bcrypt_hashed_password",
		});
		mockUserRepository.findByEmail.mockResolvedValue(fakeUser);

		const result = await useCase.execute({
			email: "john.doe@example.com",
			otp: "123456",
		});

		expect(result.user.id).toBe("usr-123");
		expect(result.user.email).toBe("john.doe@example.com");
		expect(result.accessToken).toBe("mock_access_token");
		expect(result.refreshToken).toBe("mock_refresh_token");

		expect(fakeUser.isEmailVerified).toBe(true);
		expect(mockUserRepository.update).toHaveBeenCalledWith("usr-123", fakeUser);
		expect(mockOtpService.verifyOtp).toHaveBeenCalledWith(
			"john.doe@example.com",
			"123456",
		);
		expect(mockRefreshTokenRepository.save).toHaveBeenCalled();
		expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith({
			userId: "usr-123",
			email: "john.doe@example.com",
		});
	});

	it("should handle device when device is provided in DTO", async () => {
		mockOtpService.verifyOtp.mockResolvedValue(true);

		const fakeUser = UserEntity.create({
			id: "usr-123",
			fullName: FullName.create("John Doe"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("john.doe@example.com"),
			passwordHash: "bcrypt_hashed_password",
		});
		mockUserRepository.findByEmail.mockResolvedValue(fakeUser);
		mockDeviceRepository.findByUserIdAndPlatform.mockResolvedValue(null);

		const result = await useCase.execute({
			email: "john.doe@example.com",
			otp: "123456",
			device: {
				deviceName: "Pixel 8",
				platform: "ANDROID",
				fcmToken: "fcm_token_123",
			},
		});

		expect(result.accessToken).toBe("mock_access_token");
		expect(mockDeviceRepository.save).toHaveBeenCalled();
	});

	it("should throw UserNotFoundError if user is not found in database", async () => {
		mockOtpService.verifyOtp.mockResolvedValue(true);
		mockUserRepository.findByEmail.mockResolvedValue(null);

		await expect(
			useCase.execute({
				email: "john.doe@example.com",
				otp: "123456",
			}),
		).rejects.toThrow(UserNotFoundError);
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
