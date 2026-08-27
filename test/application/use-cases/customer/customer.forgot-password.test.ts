import type {
	IEmailQueueProducer,
	IOtpService,
} from "@application/ports/services";
import { CustomerForgotPasswordUseCase } from "@application/use-cases/customer.forgot-password";
import { UserEntity } from "@domain/entities";
import { InvalidCredentialsError } from "@domain/errors";
import type { IUserRepository } from "@domain/repositories";
import { Email, FullName, PhoneNumber } from "@domain/value-objects";

describe("CustomerForgotPasswordUseCase", () => {
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

	const mockEmailQueueProducer: jest.Mocked<IEmailQueueProducer> = {
		queueVerificationEmail: jest.fn(),
	};

	let useCase: CustomerForgotPasswordUseCase;

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
		jest.resetAllMocks();

		useCase = new CustomerForgotPasswordUseCase(
			mockUserRepository,
			mockOtpService,
			mockEmailQueueProducer,
		);
	});

	it("should generate OTP and queue verification email when user exists", async () => {
		const email = "customer@test.com";
		const otp = "123456";
		const user = createUser();

		mockUserRepository.findByEmail.mockResolvedValue(user);
		mockOtpService.generateAndStoreOtp.mockResolvedValue(otp);
		mockEmailQueueProducer.queueVerificationEmail.mockResolvedValue();

		await expect(useCase.execute(email)).resolves.toBeUndefined();

		expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);

		expect(mockOtpService.generateAndStoreOtp).toHaveBeenCalledWith(
			user.email.getValue(),
		);

		expect(mockEmailQueueProducer.queueVerificationEmail).toHaveBeenCalledWith({
			email,
			otp,
		});
	});

	it("should throw InvalidCredentialsError when user does not exist", async () => {
		const email = "unknown@test.com";

		mockUserRepository.findByEmail.mockResolvedValue(null);

		await expect(useCase.execute(email)).rejects.toThrow(
			InvalidCredentialsError,
		);

		expect(mockOtpService.generateAndStoreOtp).not.toHaveBeenCalled();

		expect(
			mockEmailQueueProducer.queueVerificationEmail,
		).not.toHaveBeenCalled();
	});

	it("should propagate error when OTP generation fails", async () => {
		const email = "customer@test.com";
		const user = createUser();

		mockUserRepository.findByEmail.mockResolvedValue(user);

		mockOtpService.generateAndStoreOtp.mockRejectedValue(
			new Error("OTP generation failed"),
		);

		await expect(useCase.execute(email)).rejects.toThrow(
			"OTP generation failed",
		);

		expect(
			mockEmailQueueProducer.queueVerificationEmail,
		).not.toHaveBeenCalled();
	});

	it("should propagate error when email queue fails", async () => {
		const email = "customer@test.com";
		const otp = "123456";
		const user = createUser();

		mockUserRepository.findByEmail.mockResolvedValue(user);
		mockOtpService.generateAndStoreOtp.mockResolvedValue(otp);

		mockEmailQueueProducer.queueVerificationEmail.mockRejectedValue(
			new Error("Email queue failed"),
		);

		await expect(useCase.execute(email)).rejects.toThrow("Email queue failed");
	});

	it("should pass the generated OTP to the email queue", async () => {
		const email = "customer@test.com";
		const otp = "654321";
		const user = createUser();

		mockUserRepository.findByEmail.mockResolvedValue(user);
		mockOtpService.generateAndStoreOtp.mockResolvedValue(otp);
		mockEmailQueueProducer.queueVerificationEmail.mockResolvedValue();

		await useCase.execute(email);

		expect(mockEmailQueueProducer.queueVerificationEmail).toHaveBeenCalledWith({
			email,
			otp,
		});
	});
});
