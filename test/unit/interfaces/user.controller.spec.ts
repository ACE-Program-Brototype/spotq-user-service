import type {
	ILogoutUseCase,
	IRegisterUserUseCase,
	IResendEmailOtpUseCase,
	IVerifyEmailOtpUseCase,
} from "@ports/use-cases/index.ts";
import { UserController } from "@interfaces/http/controllers/user.controller.ts";
import type { AuthenticatedRequest } from "@interfaces/http/middlewares/auth.middleware.ts";
import type { NextFunction, Request, Response } from "express";

describe("UserController", () => {
	let mockRegisterUseCase: jest.Mocked<Partial<IRegisterUserUseCase>>;
	let mockVerifyEmailOtpUseCase: jest.Mocked<Partial<IVerifyEmailOtpUseCase>>;
	let mockResendEmailOtpUseCase: jest.Mocked<Partial<IResendEmailOtpUseCase>>;
	let mockLogoutUseCase: jest.Mocked<Partial<ILogoutUseCase>>;
	let controller: UserController;
	let mockReq: Partial<AuthenticatedRequest>;
	let mockRes: Partial<Response>;
	let mockNext: jest.MockedFunction<NextFunction>;

	beforeEach(() => {
		mockRegisterUseCase = {
			execute: jest.fn(),
		};
		mockVerifyEmailOtpUseCase = {
			execute: jest.fn(),
		};
		mockResendEmailOtpUseCase = {
			execute: jest.fn(),
		};
		mockLogoutUseCase = {
			execute: jest.fn(),
		};

		controller = new UserController(
			mockRegisterUseCase as IRegisterUserUseCase,
			mockVerifyEmailOtpUseCase as IVerifyEmailOtpUseCase,
			mockResendEmailOtpUseCase as IResendEmailOtpUseCase,
			mockLogoutUseCase as ILogoutUseCase,
		);

		mockReq = {
			body: {},
		};
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		mockNext = jest.fn();
	});

	it("should return 201 on successful registration", async () => {
		const registrationResult = {
			user: {
				id: "u-1",
				fullName: "John",
				email: "john@example.com",
				phoneNumber: "+919876543210",
				status: "ACTIVE" as const,
				createdAt: new Date(),
			},
			accessToken: "access_token_123",
			refreshToken: "refresh_token_123",
		};

		(mockRegisterUseCase.execute as jest.Mock).mockResolvedValue(
			registrationResult,
		);

		mockReq.body = {
			fullName: "John",
			email: "john@example.com",
			phoneNumber: "+919876543210",
			password: "Password@123",
		};

		await controller.register(
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(201);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				statusCode: 201,
				data: registrationResult,
			}),
		);
	});

	it("should return 200 on successful email OTP verification", async () => {
		(mockVerifyEmailOtpUseCase.execute as jest.Mock).mockResolvedValue({
			success: true,
			message: "Email verified successfully.",
		});

		mockReq.body = {
			email: "john@example.com",
			otp: "123456",
		};

		await controller.verifyEmail(
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(200);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: "Email verified successfully.",
			}),
		);
	});

	it("should return 200 on successful OTP resend", async () => {
		(mockResendEmailOtpUseCase.execute as jest.Mock).mockResolvedValue({
			success: true,
			message: "Verification OTP resent successfully.",
		});

		mockReq.body = {
			email: "john@example.com",
		};

		await controller.resendEmailOtp(
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(200);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: "Verification OTP resent successfully.",
			}),
		);
	});

	it("should return 200 on successful logout", async () => {
		(mockLogoutUseCase.execute as jest.Mock).mockResolvedValue({
			success: true,
			message: "Logged out successfully.",
		});

		mockReq.user = {
			userId: "usr-1",
			email: "john@example.com",
		};
		mockReq.body = {
			refreshToken: "some-refresh-token",
		};

		await controller.logout(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(200);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: "Logged out successfully.",
			}),
		);
	});
});
