import type {
	IEmailQueueProducer,
	IOtpService,
	IPasswordHasher,
	ITokenService,
	IIdGenerator,
	ILogger,
} from "@application/ports/services/index.ts";
import { RegisterUserUseCase } from "@application/use-cases/register-user.use-case.ts";
import { UserEntity } from "@domain/entities/user.entity.ts";
import {
	EmailAlreadyExistsError,
	PhoneAlreadyExistsError,
} from "@domain/errors/domain.error.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";

describe("RegisterUserUseCase", () => {
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
	let mockTokenService: jest.Mocked<ITokenService>;
	let mockOtpService: jest.Mocked<IOtpService>;
	let mockEmailQueueProducer: jest.Mocked<IEmailQueueProducer>;
	let mockIdGenerator: jest.Mocked<IIdGenerator>;
	let mockLogger: jest.Mocked<ILogger>;
	let useCase: RegisterUserUseCase;

	beforeEach(() => {
		mockUserRepository = {
			findByEmail: jest.fn(),
			findByPhone: jest.fn(),
			findById: jest.fn(),
			createWithSession: jest.fn(),
		};

		mockPasswordHasher = {
			hash: jest.fn().mockResolvedValue("bcrypt_hashed_password"),
			compare: jest.fn(),
		};

		mockTokenService = {
			generateAccessToken: jest.fn().mockReturnValue("mock_access_token"),
			generateRefreshToken: jest.fn().mockReturnValue({
				token: "mock_plain_refresh_token",
				tokenHash: "mock_refresh_token_hash",
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			}),
			hashToken: jest.fn(),
			verifyAccessToken: jest.fn(),
		};

		mockOtpService = {
			generateAndStoreOtp: jest.fn().mockResolvedValue("123456"),
			verifyOtp: jest.fn(),
			invalidateOtp: jest.fn(),
		};

		mockEmailQueueProducer = {
			queueVerificationEmail: jest.fn().mockResolvedValue(undefined),
		};

		mockIdGenerator = {
			generateUuid: jest.fn().mockReturnValue("usr-123"),
		};

		mockLogger = {
			info: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
		};

		useCase = new RegisterUserUseCase(
			mockUserRepository,
			mockPasswordHasher,
			mockTokenService,
			mockOtpService,
			mockEmailQueueProducer,
			mockIdGenerator,
			mockLogger,
		);
	});

	it("should successfully register customer and return user with tokens", async () => {
		mockUserRepository.findByEmail.mockResolvedValue(null);
		mockUserRepository.findByPhone.mockResolvedValue(null);

		const fakeUser = UserEntity.create({
			id: "usr-123",
			fullName: FullName.create("John Doe"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("john.doe@example.com"),
			passwordHash: "bcrypt_hashed_password",
		});
		mockUserRepository.createWithSession.mockResolvedValue(fakeUser);

		const result = await useCase.execute({
			fullName: "John Doe",
			email: "john.doe@example.com",
			phoneNumber: "+919876543210",
			password: "Password@123",
			device: {
				deviceName: "iPhone 15",
				platform: "IOS",
				fcmToken: "fcm_token_xyz",
			},
		});

		expect(result.user.fullName).toBe("John Doe");
		expect(result.user.email).toBe("john.doe@example.com");
		expect(result.user.phoneNumber).toBe("+919876543210");
		expect(result.user.status).toBe("ACTIVE");
		expect(result.accessToken).toBe("mock_access_token");
		expect(result.refreshToken).toBe("mock_plain_refresh_token");

		expect(mockUserRepository.createWithSession).toHaveBeenCalled();
		expect(mockOtpService.generateAndStoreOtp).toHaveBeenCalledWith(
			"john.doe@example.com",
		);
		expect(mockEmailQueueProducer.queueVerificationEmail).toHaveBeenCalledWith({
			email: "john.doe@example.com",
			otp: "123456",
		});
	});

	it("should throw EmailAlreadyExistsError when email is already registered", async () => {
		const existingUser = UserEntity.create({
			id: "existing-usr",
			fullName: FullName.create("Existing User"),
			phone: PhoneNumber.create("+919999999999"),
			email: Email.create("john.doe@example.com"),
			passwordHash: "hash",
		});
		mockUserRepository.findByEmail.mockResolvedValue(existingUser);

		await expect(
			useCase.execute({
				fullName: "John Doe",
				email: "john.doe@example.com",
				phoneNumber: "+919876543210",
				password: "Password@123",
			}),
		).rejects.toThrow(EmailAlreadyExistsError);

		expect(mockUserRepository.createWithSession).not.toHaveBeenCalled();
	});

	it("should throw PhoneAlreadyExistsError when phone is already registered", async () => {
		mockUserRepository.findByEmail.mockResolvedValue(null);

		const existingUser = UserEntity.create({
			id: "existing-usr",
			fullName: FullName.create("Existing User"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("other@example.com"),
			passwordHash: "hash",
		});
		mockUserRepository.findByPhone.mockResolvedValue(existingUser);

		await expect(
			useCase.execute({
				fullName: "John Doe",
				email: "john.doe@example.com",
				phoneNumber: "+919876543210",
				password: "Password@123",
			}),
		).rejects.toThrow(PhoneAlreadyExistsError);

		expect(mockUserRepository.createWithSession).not.toHaveBeenCalled();
	});
});
