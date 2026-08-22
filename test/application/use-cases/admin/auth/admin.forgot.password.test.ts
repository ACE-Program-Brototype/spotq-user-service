import { AdminForgotPasswordUseCase } from "@application/use-cases/admin/auth/admin.forgot-password";
import type { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";
import type { IEmailQueueProducer } from "@domain/repository/shared/IEmail.queue.producer";
import type { IOtpService } from "@domain/repository/shared/IOtp.service";

describe("AdminForgotPasswordUseCase", () => {
	const mockAdminRepository: jest.Mocked<IAdminAuthRepository> = {
		find: jest.fn(),
		findById: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		findByEmail: jest.fn(),
	};

	const mockOtpService: jest.Mocked<IOtpService> = {
		generateAndStoreOtp: jest.fn(),
		verifyOtp: jest.fn(),
		invalidateOtp: jest.fn(),
	};

	const mockEmailQueueProducer: jest.Mocked<IEmailQueueProducer> = {
		queueVerificationEmail: jest.fn(),
	};

	let useCase: AdminForgotPasswordUseCase;

	beforeEach(() => {
		jest.clearAllMocks();

		useCase = new AdminForgotPasswordUseCase(
			mockAdminRepository,
			mockOtpService,
			mockEmailQueueProducer,
		);
	});

	it("should generate OTP and queue verification email for existing admin", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "hashed-password",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		};

		mockAdminRepository.findByEmail.mockResolvedValue(admin);

		mockOtpService.generateAndStoreOtp.mockResolvedValue("123456");

		mockEmailQueueProducer.queueVerificationEmail.mockResolvedValue(undefined);

		await expect(useCase.execute("admin@test.com")).resolves.toBeUndefined();

		expect(mockAdminRepository.findByEmail).toHaveBeenCalledTimes(1);

		expect(mockAdminRepository.findByEmail).toHaveBeenCalledWith(
			"admin@test.com",
		);

		expect(mockOtpService.generateAndStoreOtp).toHaveBeenCalledTimes(1);

		expect(mockOtpService.generateAndStoreOtp).toHaveBeenCalledWith(
			"admin@test.com",
		);

		expect(mockEmailQueueProducer.queueVerificationEmail).toHaveBeenCalledTimes(
			1,
		);

		expect(mockEmailQueueProducer.queueVerificationEmail).toHaveBeenCalledWith({
			email: "admin@test.com",
			otp: "123456",
		});
	});

	it("should throw when admin does not exist", async () => {
		mockAdminRepository.findByEmail.mockResolvedValue(null);

		await expect(useCase.execute("unknown@test.com")).rejects.toThrow(
			"Invalid credentials",
		);

		expect(mockAdminRepository.findByEmail).toHaveBeenCalledWith(
			"unknown@test.com",
		);

		expect(mockOtpService.generateAndStoreOtp).not.toHaveBeenCalled();

		expect(
			mockEmailQueueProducer.queueVerificationEmail,
		).not.toHaveBeenCalled();
	});

	it("should not queue email when OTP generation fails", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "hashed-password",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		};

		mockAdminRepository.findByEmail.mockResolvedValue(admin);

		mockOtpService.generateAndStoreOtp.mockRejectedValue(
			new Error("OTP generation failed"),
		);

		await expect(useCase.execute("admin@test.com")).rejects.toThrow(
			"OTP generation failed",
		);

		expect(
			mockEmailQueueProducer.queueVerificationEmail,
		).not.toHaveBeenCalled();
	});

	it("should propagate email queue errors", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "hashed-password",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
		};

		mockAdminRepository.findByEmail.mockResolvedValue(admin);

		mockOtpService.generateAndStoreOtp.mockResolvedValue("123456");

		mockEmailQueueProducer.queueVerificationEmail.mockRejectedValue(
			new Error("Email queue failed"),
		);

		await expect(useCase.execute("admin@test.com")).rejects.toThrow(
			"Email queue failed",
		);

		expect(mockEmailQueueProducer.queueVerificationEmail).toHaveBeenCalledWith({
			email: "admin@test.com",
			otp: "123456",
		});
	});
});
