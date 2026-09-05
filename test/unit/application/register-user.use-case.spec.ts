import type {
	IEmailQueueProducer,
	IIdGenerator,
	ILogger,
	IOtpService,
	IPasswordHasher,
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
			findByGoogleId: jest.fn(),
			create: jest.fn(),
			createWithSession: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			find: jest.fn(),
		} as unknown as jest.Mocked<IUserRepository>;

		mockPasswordHasher = {
			hash: jest.fn().mockResolvedValue("bcrypt_hashed_password"),
			compare: jest.fn(),
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
		} as unknown as jest.Mocked<ILogger>;

		useCase = new RegisterUserUseCase(
			mockUserRepository,
			mockPasswordHasher,
			mockOtpService,
			mockEmailQueueProducer,
			mockIdGenerator,
			mockLogger,
		);
	});

	it("should successfully register customer and send OTP without returning tokens", async () => {
		mockUserRepository.findByEmail.mockResolvedValue(null);
		mockUserRepository.findByPhone.mockResolvedValue(null);

		const fakeUser = UserEntity.create({
			id: "usr-123",
			fullName: FullName.create("John Doe"),
			phone: PhoneNumber.create("+919876543210"),
			email: Email.create("john.doe@example.com"),
			passwordHash: "bcrypt_hashed_password",
		});
		mockUserRepository.create.mockResolvedValue(fakeUser);

		await expect(
			useCase.execute({
				fullName: "John Doe",
				email: "john.doe@example.com",
				phoneNumber: "+919876543210",
				password: "Password@123",
				device: {
					deviceName: "iPhone 15",
					platform: "IOS",
					fcmToken: "fcm_token_xyz",
				},
			}),
		).resolves.toBeUndefined();

		expect(mockUserRepository.create).toHaveBeenCalled();
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

		expect(mockUserRepository.create).not.toHaveBeenCalled();
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

		expect(mockUserRepository.create).not.toHaveBeenCalled();
	});
});
