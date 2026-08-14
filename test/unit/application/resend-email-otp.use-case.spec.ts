import type {
	IEmailQueueProducer,
	IOtpService,
} from "@application/ports/services/index.ts";
import { ResendEmailOtpUseCase } from "@application/use-cases/resend-email-otp.use-case.ts";
import { UserEntity } from "@domain/entities/user.entity.ts";
import { UserNotFoundError } from "@domain/errors/domain.error.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";

describe("ResendEmailOtpUseCase", () => {
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let mockOtpService: jest.Mocked<IOtpService>;
	let mockEmailQueueProducer: jest.Mocked<IEmailQueueProducer>;
	let useCase: ResendEmailOtpUseCase;

	beforeEach(() => {
		mockUserRepository = {
			findByEmail: jest.fn(),
			findByPhone: jest.fn(),
			findById: jest.fn(),
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

		useCase = new ResendEmailOtpUseCase(
			mockUserRepository,
			mockOtpService,
			mockEmailQueueProducer,
		);
	});

	it("should regenerate OTP and queue email when user exists", async () => {
		const fakeUser = UserEntity.create({
			id: "usr-123",
			fullName: FullName.create("John Doe"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("john.doe@example.com"),
			passwordHash: "hash",
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

	it("should throw UserNotFoundError when user is not found", async () => {
		mockUserRepository.findByEmail.mockResolvedValue(null);

		await expect(
			useCase.execute({ email: "unknown@example.com" }),
		).rejects.toThrow(UserNotFoundError);

		expect(mockOtpService.generateAndStoreOtp).not.toHaveBeenCalled();
		expect(
			mockEmailQueueProducer.queueVerificationEmail,
		).not.toHaveBeenCalled();
	});
});
