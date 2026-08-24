import type {
	IIdGenerator,
	ILogger,
	ITokenService,
} from "@application/ports/services/index.ts";
import { RefreshTokenUseCase } from "@application/use-cases/refresh-token.use-case.ts";
import { RefreshTokenEntity } from "@domain/entities/refresh-token.entity.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import { InvalidTokenError } from "@domain/errors/index.ts";
import type {
	IRefreshTokenRepository,
	IUserRepository,
} from "@domain/repositories/index.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";

describe("RefreshTokenUseCase", () => {
	let useCase: RefreshTokenUseCase;
	let mockRefreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let mockTokenService: jest.Mocked<ITokenService>;
	let mockIdGenerator: jest.Mocked<IIdGenerator>;
	let mockLogger: jest.Mocked<ILogger>;

	const mockUser = UserEntity.create({
		id: "usr-123",
		fullName: FullName.create("John Doe"),
		email: Email.create("john@example.com"),
		phone: PhoneNumber.create("+919876543210"),
		passwordHash: "some-hash",
	});

	const mockTokenEntity = RefreshTokenEntity.create({
		id: "tok-1",
		userId: "usr-123",
		deviceId: "dev-1",
		tokenHash: "hashed-input-token",
		expiresAt: new Date(Date.now() + 1000000),
	});

	beforeEach(() => {
		mockRefreshTokenRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			findByTokenHash: jest.fn(),
			revoke: jest.fn().mockResolvedValue(undefined),
			revokeAllForUser: jest.fn().mockResolvedValue(undefined),
		} as unknown as jest.Mocked<IRefreshTokenRepository>;

		mockUserRepository = {
			findById: jest.fn(),
			findByEmail: jest.fn(),
			findByPhone: jest.fn(),
			findByGoogleId: jest.fn(),
			createWithSession: jest.fn(),
		} as unknown as jest.Mocked<IUserRepository>;

		mockTokenService = {
			generateAccessToken: jest.fn().mockReturnValue("new-access-token"),
			generateRefreshToken: jest.fn().mockReturnValue({
				token: "new-refresh-token-plain",
				tokenHash: "new-refresh-token-hash",
				expiresAt: new Date(Date.now() + 2000000),
			}),
			hashToken: jest.fn().mockReturnValue("hashed-input-token"),
			verifyAccessToken: jest.fn(),
		} as unknown as jest.Mocked<ITokenService>;

		mockIdGenerator = {
			generateUuid: jest.fn().mockReturnValue("new-uuid-123"),
		};

		mockLogger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		};

		useCase = new RefreshTokenUseCase(
			mockRefreshTokenRepository,
			mockUserRepository,
			mockTokenService,
			mockIdGenerator,
			mockLogger,
		);
	});

	it("should successfully rotate refresh token and return new tokens with user info", async () => {
		mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(
			mockTokenEntity,
		);
		mockUserRepository.findById.mockResolvedValue(mockUser);

		const result = await useCase.execute({
			refreshToken: "valid-input-token",
		});

		expect(result).toEqual({
			accessToken: "new-access-token",
			refreshToken: "new-refresh-token-plain",
			user: {
				id: "usr-123",
				email: "john@example.com",
				fullName: "John Doe",
				status: UserStatus.ACTIVE,
			},
		});

		expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledWith(
			"hashed-input-token",
			expect.any(Date),
		);
		expect(mockRefreshTokenRepository.save).toHaveBeenCalled();
		expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith({
			userId: "usr-123",
			email: "john@example.com",
		});
	});

	it("should throw InvalidTokenError if refresh token is not found or invalid", async () => {
		mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(null);

		await expect(
			useCase.execute({ refreshToken: "invalid-token" }),
		).rejects.toThrow(InvalidTokenError);
	});

	it("should throw InvalidTokenError if user is not found", async () => {
		mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(
			mockTokenEntity,
		);
		mockUserRepository.findById.mockResolvedValue(null);

		await expect(
			useCase.execute({ refreshToken: "valid-token" }),
		).rejects.toThrow(InvalidTokenError);
	});

	it("should throw InvalidTokenError if user account is blocked", async () => {
		const blockedUser = UserEntity.reconstitute({
			id: "usr-123",
			fullName: FullName.create("John Doe"),
			email: Email.create("john@example.com"),
			phone: null,
			passwordHash: "hash",
			status: UserStatus.BLOCKED,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(
			mockTokenEntity,
		);
		mockUserRepository.findById.mockResolvedValue(blockedUser);

		await expect(
			useCase.execute({ refreshToken: "valid-token" }),
		).rejects.toThrow(InvalidTokenError);
	});

	it("should throw InvalidTokenError if user account is inactive", async () => {
		const inactiveUser = UserEntity.reconstitute({
			id: "usr-123",
			fullName: FullName.create("John Doe"),
			email: Email.create("john@example.com"),
			phone: null,
			passwordHash: "hash",
			status: UserStatus.INACTIVE,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(
			mockTokenEntity,
		);
		mockUserRepository.findById.mockResolvedValue(inactiveUser);

		await expect(
			useCase.execute({ refreshToken: "valid-token" }),
		).rejects.toThrow(InvalidTokenError);
	});
});
