import type {
	IEmailQueueProducer,
	ILogger,
	IOtpService,
} from "@application/ports/services/index.ts";
import { ResendEmailOtpUseCase } from "@application/use-cases/resend-email-otp.use-case.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import { UserBlockedError } from "@domain/errors/domain.error.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";

describe("ResendEmailOtpUseCase", () => {
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let mockOtpService: jest.Mocked<IOtpService>;
	let mockEmailQueueProducer: jest.Mocked<IEmailQueueProducer>;
	let mockLogger: jest.Mocked<ILogger>;
	let useCase: ResendEmailOtpUseCase;

	beforeEach(() => {
		mockUserRepository = {
			findByEmail: jest.fn(),
			findByPhone: jest.fn(),
			findById: jest.fn(),
			findByGoogleId: jest.fn(),
			createWithSession: jest.fn(),
		};

		mockOtpService = {
			generateAndStoreOtp: jest.fn().mockResolvedValue("654321"),
			verifyOtp: jest.fn(),
			invalidateOtp: jest.fn(),
		};

		mockEmailQueueProducer = {
			queueVerificationEmail: jest.fn().mockResolvedValue(undefined),
		};

		mockLogger = {
			info: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
		};

		useCase = new ResendEmailOtpUseCase(
			mockUserRepository,
			mockOtpService,
			mockEmailQueueProducer,
			mockLogger,
		);
	});

	it("should regenerate OTP and queue email when user exists and is unverified", async () => {
		const fakeUser = UserEntity.reconstitute({
			createdAt: new Date(),
			updatedAt: new Date(),
			googleId: null,
			profile: null,
			id: "usr-123",
			fullName: FullName.create("John Doe"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("john.doe@example.com"),
			passwordHash: "hash",
			status: UserStatus.ACTIVE,
			isEmailVerified: false,
		});
		mockUserRepository.findByEmail.mockResolvedValue(fakeUser);

		const result = await useCase.execute({ email: "john.doe@example.com" });

		expect(result.success).toBe(true);
		expect(result.message).toBe("Verification OTP resent successfully.");
		expect(mockOtpService.generateAndStoreOtp).toHaveBeenCalledWith(
			"john.doe@example.com",
		);
		expect(mockEmailQueueProducer.queueVerificationEmail).toHaveBeenCalledWith({
			email: "john.doe@example.com",
			otp: "654321",
		});
	});

	it("should return generic success and not send OTP when user is already verified (anti-enumeration)", async () => {
		const verifiedUser = UserEntity.reconstitute({
			createdAt: new Date(),
			updatedAt: new Date(),
			googleId: null,
			profile: null,
			id: "usr-123",
			fullName: FullName.create("John Doe"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("john.doe@example.com"),
			passwordHash: "hash",
			status: UserStatus.ACTIVE,
			isEmailVerified: true,
		});
		mockUserRepository.findByEmail.mockResolvedValue(verifiedUser);

		const result = await useCase.execute({ email: "john.doe@example.com" });

		expect(result.success).toBe(true);
		expect(result.message).toBe("Verification OTP resent successfully.");
		expect(mockOtpService.generateAndStoreOtp).not.toHaveBeenCalled();
		expect(
			mockEmailQueueProducer.queueVerificationEmail,
		).not.toHaveBeenCalled();
	});

	it("should return generic success and not send OTP when user is not found (anti-enumeration)", async () => {
		mockUserRepository.findByEmail.mockResolvedValue(null);

		const result = await useCase.execute({ email: "unknown@example.com" });

		expect(result.success).toBe(true);
		expect(result.message).toBe("Verification OTP resent successfully.");
		expect(mockOtpService.generateAndStoreOtp).not.toHaveBeenCalled();
		expect(
			mockEmailQueueProducer.queueVerificationEmail,
		).not.toHaveBeenCalled();
	});

	it("should throw UserBlockedError when user account is blocked", async () => {
		const blockedUser = UserEntity.reconstitute({
			createdAt: new Date(),
			updatedAt: new Date(),
			googleId: null,
			profile: null,
			id: "usr-123",
			fullName: FullName.create("John Doe"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("john.doe@example.com"),
			passwordHash: "hash",
			status: UserStatus.BLOCKED,
			isEmailVerified: false,
		});
		mockUserRepository.findByEmail.mockResolvedValue(blockedUser);

		await expect(
			useCase.execute({ email: "john.doe@example.com" }),
		).rejects.toThrow(UserBlockedError);

		expect(mockOtpService.generateAndStoreOtp).not.toHaveBeenCalled();
		expect(
			mockEmailQueueProducer.queueVerificationEmail,
		).not.toHaveBeenCalled();
	});
});
