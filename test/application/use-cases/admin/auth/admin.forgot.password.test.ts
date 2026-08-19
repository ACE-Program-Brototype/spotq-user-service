import { AdminForgotPasswordUseCase } from "@application/use-cases/admin/auth/admin.forgot-password";

describe("AdminForgotPasswordUseCase", () => {
	const adminRepository = {
		findByEmail: jest.fn(),
	};

	const otpService = {
		generateAndStoreOtp: jest.fn(),
	};

	const emailQueueProducer = {
		queueVerificationEmail: jest.fn(),
	};

	let useCase: AdminForgotPasswordUseCase;

	beforeEach(() => {
		jest.clearAllMocks();

		useCase = new AdminForgotPasswordUseCase(
			adminRepository as any,
			otpService as any,
			emailQueueProducer as any,
		);
	});

	it("should generate OTP and send verification email for existing admin", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "hashed-password",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		adminRepository.findByEmail.mockResolvedValue(admin);
		otpService.generateAndStoreOtp.mockResolvedValue("123456");
		emailQueueProducer.queueVerificationEmail.mockResolvedValue(undefined);

		await expect(useCase.execute("admin@test.com")).resolves.toBeUndefined();

		expect(adminRepository.findByEmail).toHaveBeenCalledWith("admin@test.com");

		expect(otpService.generateAndStoreOtp).toHaveBeenCalledWith(
			"admin@test.com",
		);

		expect(emailQueueProducer.queueVerificationEmail).toHaveBeenCalledWith({
			email: "admin@test.com",
			otp: "123456",
		});
	});

	it("should throw USER_NOT_FOUND when admin does not exist", async () => {
		adminRepository.findByEmail.mockResolvedValue(null);

		await expect(useCase.execute("unknown@test.com")).rejects.toThrow();

		expect(adminRepository.findByEmail).toHaveBeenCalledWith(
			"unknown@test.com",
		);

		expect(otpService.generateAndStoreOtp).not.toHaveBeenCalled();

		expect(emailQueueProducer.queueVerificationEmail).not.toHaveBeenCalled();
	});

	it("should not queue email when OTP generation fails", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "hashed-password",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		adminRepository.findByEmail.mockResolvedValue(admin);

		otpService.generateAndStoreOtp.mockRejectedValue(
			new Error("OTP generation failed"),
		);

		await expect(useCase.execute("admin@test.com")).rejects.toThrow(
			"OTP generation failed",
		);

		expect(emailQueueProducer.queueVerificationEmail).not.toHaveBeenCalled();
	});

	it("should propagate email queue errors", async () => {
		const admin = {
			id: "admin-123",
			name: "Test Admin",
			email: "admin@test.com",
			passwordHash: "hashed-password",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		adminRepository.findByEmail.mockResolvedValue(admin);
		otpService.generateAndStoreOtp.mockResolvedValue("123456");

		emailQueueProducer.queueVerificationEmail.mockRejectedValue(
			new Error("Email queue failed"),
		);

		await expect(useCase.execute("admin@test.com")).rejects.toThrow(
			"Email queue failed",
		);
	});
});
