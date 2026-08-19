import type {
	IGoogleAuthService,
	IIdGenerator,
	ILogger,
	ITokenService,
} from "@application/ports/services/index.ts";
import { GoogleAuthUseCase } from "@application/use-cases/google-auth.use-case.ts";
import { DeviceEntity } from "@domain/entities/device.entity.ts";
import { UserEntity } from "@domain/entities/user.entity.ts";
import {
	EmailAlreadyRegisteredError,
	UserBlockedError,
} from "@domain/errors/domain.error.ts";
import type {
	IDeviceRepository,
	IRefreshTokenRepository,
	IUserRepository,
} from "@domain/repositories/index.ts";
import { Email, FullName } from "@domain/value-objects/index.ts";

describe("GoogleAuthUseCase", () => {
	let useCase: GoogleAuthUseCase;
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let mockTokenService: jest.Mocked<ITokenService>;
	let mockGoogleAuthService: jest.Mocked<IGoogleAuthService>;
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
		};
		mockTokenService = {
			generateAccessToken: jest.fn().mockReturnValue("access-token-abc"),
			generateRefreshToken: jest.fn().mockReturnValue({
				token: "refresh-token-xyz",
				tokenHash: "hashed-refresh-token",
				expiresAt: new Date(Date.now() + 100000),
			}),
			hashToken: jest.fn().mockReturnValue("hashed-token-xyz"),
			verifyAccessToken: jest.fn(),
		};
		mockGoogleAuthService = {
			verifyIdToken: jest.fn(),
		};
		mockDeviceRepository = {
			save: jest.fn(),
			findByUserIdAndPlatform: jest.fn(),
			findById: jest.fn(),
		};
		mockRefreshTokenRepository = {
			save: jest.fn(),
			findByTokenHash: jest.fn(),
			revoke: jest.fn(),
			revokeAllForUser: jest.fn(),
		};
		mockLogger = {
			info: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
		};
		mockIdGenerator = {
			generateUuid: jest.fn().mockReturnValue("mock-generated-uuid"),
		};

		useCase = new GoogleAuthUseCase(
			mockUserRepository,
			mockTokenService,
			mockGoogleAuthService,
			mockDeviceRepository,
			mockRefreshTokenRepository,
			mockIdGenerator,
			mockLogger,
		);
	});

	it("should register a new Google user successfully when no existing account is found", async () => {
		const payload = {
			sub: "google-sub-123",
			email: "john@gmail.com",
			emailVerified: true,
			name: "John Doe",
			picture: "https://example.com/john.jpg",
		};

		mockGoogleAuthService.verifyIdToken.mockResolvedValue(payload);
		mockUserRepository.findByGoogleId.mockResolvedValue(null);
		mockUserRepository.findByEmail.mockResolvedValue(null);

		const createdUser = UserEntity.create({
			id: "user-uuid",
			fullName: FullName.create("John Doe"),
			phone: null,
			email: Email.create("john@gmail.com"),
			passwordHash: null,
			googleId: "google-sub-123",
		});

		mockUserRepository.createWithSession.mockResolvedValue(createdUser);

		const result = await useCase.execute({ idToken: "valid-token" });

		expect(mockUserRepository.createWithSession).toHaveBeenCalled();
		expect(result.accessToken).toBe("access-token-abc");
		expect(result.refreshToken).toBe("refresh-token-xyz");
		expect(result.user.email).toBe("john@gmail.com");
	});

	it("should log in an existing Google user successfully without creating a new record", async () => {
		const payload = {
			sub: "google-sub-123",
			email: "john@gmail.com",
			emailVerified: true,
			name: "John Doe",
		};

		mockGoogleAuthService.verifyIdToken.mockResolvedValue(payload);

		const existingUser = UserEntity.create({
			id: "existing-user-uuid",
			fullName: FullName.create("John Doe"),
			phone: null,
			email: Email.create("john@gmail.com"),
			passwordHash: null,
			googleId: "google-sub-123",
		});

		mockUserRepository.findByGoogleId.mockResolvedValue(existingUser);

		const result = await useCase.execute({ idToken: "valid-token" });

		expect(mockUserRepository.createWithSession).not.toHaveBeenCalled();
		expect(mockRefreshTokenRepository.save).toHaveBeenCalled();
		expect(result.user.id).toBe("existing-user-uuid");
	});

	it("should throw EmailAlreadyRegisteredError when email belongs to a password-based account", async () => {
		const payload = {
			sub: "google-sub-123",
			email: "john@gmail.com",
			emailVerified: true,
			name: "John Doe",
		};

		mockGoogleAuthService.verifyIdToken.mockResolvedValue(payload);
		mockUserRepository.findByGoogleId.mockResolvedValue(null);

		const passwordUser = UserEntity.create({
			id: "existing-user-uuid",
			fullName: FullName.create("John Doe"),
			phone: null,
			email: Email.create("john@gmail.com"),
			passwordHash: "hashed-password-123",
		});

		mockUserRepository.findByEmail.mockResolvedValue(passwordUser);

		await expect(useCase.execute({ idToken: "valid-token" })).rejects.toThrow(
			EmailAlreadyRegisteredError,
		);
	});

	it("should throw UserBlockedError when existing account status is not ACTIVE", async () => {
		const payload = {
			sub: "google-sub-123",
			email: "john@gmail.com",
			emailVerified: true,
			name: "John Doe",
		};

		mockGoogleAuthService.verifyIdToken.mockResolvedValue(payload);

		const blockedUser = UserEntity.reconstitute({
			id: "blocked-user-uuid",
			fullName: FullName.create("John Doe"),
			phone: null,
			email: Email.create("john@gmail.com"),
			passwordHash: null,
			googleId: "google-sub-123",
			status: "INACTIVE" as any,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		mockUserRepository.findByGoogleId.mockResolvedValue(blockedUser);

		await expect(useCase.execute({ idToken: "valid-token" })).rejects.toThrow(
			UserBlockedError,
		);
	});

	it("should associate device info when supplied", async () => {
		const payload = {
			sub: "google-sub-123",
			email: "john@gmail.com",
			emailVerified: true,
			name: "John Doe",
		};

		mockGoogleAuthService.verifyIdToken.mockResolvedValue(payload);
		mockUserRepository.findByGoogleId.mockResolvedValue(null);
		mockUserRepository.findByEmail.mockResolvedValue(null);

		const createdUser = UserEntity.create({
			id: "user-uuid",
			fullName: FullName.create("John Doe"),
			phone: null,
			email: Email.create("john@gmail.com"),
			passwordHash: null,
			googleId: "google-sub-123",
		});

		mockUserRepository.createWithSession.mockResolvedValue(createdUser);

		await useCase.execute({
			idToken: "valid-token",
			device: {
				deviceName: "My iPhone",
				platform: "IOS",
				fcmToken: "fcm-token-123",
			},
		});

		expect(mockUserRepository.createWithSession).toHaveBeenCalledWith(
			expect.objectContaining({
				device: expect.any(DeviceEntity),
			}),
		);
	});
});
