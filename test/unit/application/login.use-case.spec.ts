import type {
	IIdGenerator,
	ILogger,
	IPasswordHasher,
	ITokenService,
} from "@application/ports/services/index.ts";
import { LoginUseCase } from "@application/use-cases/login.use-case.ts";
import { DeviceEntity } from "@domain/entities/device.entity.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import { InvalidCredentialsError } from "@domain/errors/domain.error.ts";
import type {
	IDeviceRepository,
	IRefreshTokenRepository,
	IUserRepository,
} from "@domain/repositories/index.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";

describe("LoginUseCase", () => {
	let useCase: LoginUseCase;
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let mockTokenService: jest.Mocked<ITokenService>;
	let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
	let mockDeviceRepository: jest.Mocked<IDeviceRepository>;
	let mockRefreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;
	let mockLogger: jest.Mocked<ILogger>;
	let mockIdGenerator: jest.Mocked<IIdGenerator>;

	beforeEach(() => {
		mockUserRepository = {
			findByEmail: jest.fn(),
			findByPhone: jest.fn(),
			findById: jest.fn(),
			findByGoogleId: jest.fn(),
			createWithSession: jest.fn(),
		} as unknown as jest.Mocked<IUserRepository>;
		mockTokenService = {
			generateAccessToken: jest.fn().mockReturnValue("access-token-abc"),
			generateRefreshToken: jest.fn().mockReturnValue({
				token: "refresh-token-xyz",
				tokenHash: "hashed-refresh-token",
				expiresAt: new Date(Date.now() + 100000),
			}),
			hashToken: jest.fn().mockReturnValue("hashed-token-xyz"),
			verifyAccessToken: jest.fn(),
		} as unknown as jest.Mocked<ITokenService>;
		mockPasswordHasher = {
			hash: jest.fn(),
			compare: jest.fn(),
		} as unknown as jest.Mocked<IPasswordHasher>;
		mockDeviceRepository = {
			save: jest.fn(),
			findByUserIdAndPlatform: jest.fn(),
			findById: jest.fn(),
		} as unknown as jest.Mocked<IDeviceRepository>;
		mockRefreshTokenRepository = {
			save: jest.fn(),
			findByTokenHash: jest.fn(),
			revoke: jest.fn(),
			revokeAllForUser: jest.fn(),
		} as unknown as jest.Mocked<IRefreshTokenRepository>;
		mockLogger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			debug: jest.fn(),
		} as unknown as jest.Mocked<ILogger>;
		mockIdGenerator = {
			generateUuid: jest.fn().mockReturnValue("uuid-1234"),
		} as unknown as jest.Mocked<IIdGenerator>;

		useCase = new LoginUseCase(
			mockUserRepository,
			mockDeviceRepository,
			mockRefreshTokenRepository,
			mockPasswordHasher,
			mockTokenService,
			mockIdGenerator,
			mockLogger,
		);
	});

	const createMockUser = (
		status: UserStatus = UserStatus.ACTIVE,
		hasPassword = true,
	) => {
		return UserEntity.reconstitute({
			id: "user-id-abc",
			fullName: FullName.create("Jane Doe"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("jane.doe@example.com"),
			passwordHash: hasPassword ? "hashed-pass" : null,
			status,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	};

	it("should login successfully and return tokens for active password-based user", async () => {
		const user = createMockUser();
		mockUserRepository.findByEmail.mockResolvedValue(user);
		mockPasswordHasher.compare.mockResolvedValue(true);

		const result = await useCase.execute({
			email: "  JANE.DOE@example.com  ",
			password: "password123",
		});

		expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
			"jane.doe@example.com",
		);
		expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
			"password123",
			"hashed-pass",
		);
		expect(mockRefreshTokenRepository.save).toHaveBeenCalled();
		expect(result.access_token).toBe("access-token-abc");
		expect(result.refresh_token).toBe("refresh-token-xyz");
		expect(result.user.email).toBe("jane.doe@example.com");
	});

	it("should throw InvalidCredentialsError if user is not found", async () => {
		mockUserRepository.findByEmail.mockResolvedValue(null);

		await expect(
			useCase.execute({
				email: "notfound@example.com",
				password: "password123",
			}),
		).rejects.toThrow(InvalidCredentialsError);

		expect(mockLogger.warn).toHaveBeenCalledWith(
			expect.objectContaining({ event: "LOGIN_FAILED" }),
			expect.any(String),
		);
	});

	it("should throw AccountBlockedError if user status is BLOCKED", async () => {
		const user = createMockUser(UserStatus.BLOCKED);
		mockUserRepository.findByEmail.mockResolvedValue(user);
		mockPasswordHasher.compare.mockResolvedValue(true);

		await expect(
			useCase.execute({
				email: "jane.doe@example.com",
				password: "password123",
			}),
		).rejects.toThrow(InvalidCredentialsError);

		expect(mockLogger.warn).toHaveBeenCalledWith(
			expect.objectContaining({ event: "LOGIN_BLOCKED_ACCOUNT" }),
			expect.any(String),
		);
	});

	it("should throw AccountInactiveError if user status is INACTIVE", async () => {
		const user = createMockUser(UserStatus.INACTIVE);
		mockUserRepository.findByEmail.mockResolvedValue(user);
		mockPasswordHasher.compare.mockResolvedValue(true);

		await expect(
			useCase.execute({
				email: "jane.doe@example.com",
				password: "password123",
			}),
		).rejects.toThrow(InvalidCredentialsError);

		expect(mockLogger.warn).toHaveBeenCalledWith(
			expect.objectContaining({ event: "LOGIN_INACTIVE_ACCOUNT" }),
			expect.any(String),
		);
	});

	it("should throw InvalidCredentialsError for Google-only account with null passwordHash", async () => {
		const user = createMockUser(UserStatus.ACTIVE, false);
		mockUserRepository.findByEmail.mockResolvedValue(user);

		await expect(
			useCase.execute({
				email: "jane.doe@example.com",
				password: "password123",
			}),
		).rejects.toThrow(InvalidCredentialsError);
	});

	it("should throw InvalidCredentialsError if password verification fails", async () => {
		const user = createMockUser();
		mockUserRepository.findByEmail.mockResolvedValue(user);
		mockPasswordHasher.compare.mockResolvedValue(false);

		await expect(
			useCase.execute({
				email: "jane.doe@example.com",
				password: "wrongpassword",
			}),
		).rejects.toThrow(InvalidCredentialsError);
	});

	it("should register a new device when device information is optional but supplied", async () => {
		const user = createMockUser();
		mockUserRepository.findByEmail.mockResolvedValue(user);
		mockPasswordHasher.compare.mockResolvedValue(true);
		mockDeviceRepository.findByUserIdAndPlatform.mockResolvedValue(null);

		await useCase.execute({
			email: "jane.doe@example.com",
			password: "password123",
			device: {
				deviceName: "My Phone",
				platform: "IOS",
				fcmToken: "fcm-token-1",
			},
		});

		expect(mockDeviceRepository.save).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: "user-id-abc",
				deviceName: "My Phone",
				platform: "IOS",
				fcmToken: "fcm-token-1",
			}),
		);
	});

	it("should update an existing device when it already exists", async () => {
		const user = createMockUser();
		mockUserRepository.findByEmail.mockResolvedValue(user);
		mockPasswordHasher.compare.mockResolvedValue(true);

		const existingDevice = DeviceEntity.reconstitute({
			id: "device-id-xyz",
			userId: "user-id-abc",
			deviceName: "Old Phone",
			platform: "IOS",
			fcmToken: "old-fcm-token",
			lastLogin: new Date(Date.now() - 50000),
		});
		mockDeviceRepository.findByUserIdAndPlatform.mockResolvedValue(
			existingDevice,
		);

		await useCase.execute({
			email: "jane.doe@example.com",
			password: "password123",
			device: {
				deviceName: "New Phone",
				platform: "IOS",
				fcmToken: "new-fcm-token",
			},
		});

		expect(mockDeviceRepository.save).toHaveBeenCalledWith(
			expect.objectContaining({
				id: "device-id-xyz",
				fcmToken: "new-fcm-token",
			}),
		);
	});
});
