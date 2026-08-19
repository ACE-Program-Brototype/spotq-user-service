import { UserAuthController } from "@interfaces/http/controllers/customer/user.auth.controller.ts";
import type { AuthenticatedRequest } from "@interfaces/http/middlewares/auth.middleware.ts";
import type {
	IGoogleAuthUseCase,
	ILoginUseCase,
	ILogoutUseCase,
	IRegisterUserUseCase,
	IResendEmailOtpUseCase,
	IVerifyEmailOtpUseCase,
} from "@ports/use-cases/index.ts";
import type { Request, Response } from "express";

describe("UserAuthController", () => {
	let mockRegisterUseCase: jest.Mocked<Partial<IRegisterUserUseCase>>;
	let mockVerifyEmailOtpUseCase: jest.Mocked<Partial<IVerifyEmailOtpUseCase>>;
	let mockResendEmailOtpUseCase: jest.Mocked<Partial<IResendEmailOtpUseCase>>;
	let mockLogoutUseCase: jest.Mocked<Partial<ILogoutUseCase>>;
	let mockGoogleAuthUseCase: jest.Mocked<Partial<IGoogleAuthUseCase>>;
	let mockLoginUseCase: jest.Mocked<Partial<ILoginUseCase>>;
	let controller: UserAuthController;
	let mockReq: Partial<AuthenticatedRequest>;
	let mockRes: Partial<Response>;

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
		mockGoogleAuthUseCase = {
			execute: jest.fn(),
		};
		mockLoginUseCase = {
			execute: jest.fn(),
		};

		controller = new UserAuthController(
			mockRegisterUseCase as IRegisterUserUseCase,
			mockVerifyEmailOtpUseCase as IVerifyEmailOtpUseCase,
			mockResendEmailOtpUseCase as IResendEmailOtpUseCase,
			mockLogoutUseCase as ILogoutUseCase,
			mockGoogleAuthUseCase as IGoogleAuthUseCase,
			mockLoginUseCase as ILoginUseCase,
		);

		mockReq = {
			body: {},
		};
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
			cookie: jest.fn().mockReturnThis(),
			clearCookie: jest.fn().mockReturnThis(),
		};
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

		await controller.register(mockReq as Request, mockRes as Response);

		expect(mockRes.status).toHaveBeenCalledWith(201);
		expect(mockRes.cookie).toHaveBeenCalledWith(
			"refreshToken",
			"refresh_token_123",
			expect.any(Object),
		);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				statusCode: 201,
				data: {
					user: registrationResult.user,
					accessToken: registrationResult.accessToken,
				},
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

		await controller.verifyEmail(mockReq as Request, mockRes as Response);

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

		await controller.resendEmailOtp(mockReq as Request, mockRes as Response);

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
		);

		expect(mockRes.status).toHaveBeenCalledWith(200);
		expect(mockRes.clearCookie).toHaveBeenCalledWith(
			"refreshToken",
			expect.any(Object),
		);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: "Logged out successfully.",
			}),
		);
	});

	it("should return 200 and set cookie on successful Google authentication", async () => {
		const googleAuthResult = {
			user: {
				id: "u-1",
				fullName: "John Doe",
				email: "john.doe@gmail.com",
				status: "ACTIVE",
			},
			accessToken: "access_token_123",
			refreshToken: "refresh_token_123",
		};

		(mockGoogleAuthUseCase.execute as jest.Mock).mockResolvedValue(
			googleAuthResult,
		);

		mockReq.body = {
			idToken: "some-google-id-token",
		};

		await controller.googleAuth(mockReq as Request, mockRes as Response);

		expect(mockRes.status).toHaveBeenCalledWith(200);
		expect(mockRes.cookie).toHaveBeenCalledWith(
			"refreshToken",
			"refresh_token_123",
			expect.any(Object),
		);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				statusCode: 200,
				message: "Google authentication successful.",
				data: {
					user: {
						id: "u-1",
						full_name: "John Doe",
						email: "john.doe@gmail.com",
						status: "ACTIVE",
					},
					access_token: "access_token_123",
				},
			}),
		);
	});

	it("should return 200 and set cookie on successful Login", async () => {
		const loginResult = {
			user: {
				id: "u-1",
				fullname: "John Doe",
				email: "john.doe@example.com",
				phone: "+919876543210",
				status: "ACTIVE",
				createdAt: "2026-07-14T10:00:00Z",
				updatedAt: "2026-07-14T10:00:00Z",
			},
			accessToken: "access_token_123",
			refreshToken: "refresh_token_123",
		};

		(mockLoginUseCase.execute as jest.Mock).mockResolvedValue(loginResult);

		mockReq.body = {
			email: "john.doe@example.com",
			password: "Password@123",
		};

		await controller.login(mockReq as Request, mockRes as Response);

		expect(mockRes.status).toHaveBeenCalledWith(200);
		expect(mockRes.cookie).toHaveBeenCalledWith(
			"refreshToken",
			"refresh_token_123",
			expect.any(Object),
		);
		const { refreshToken, ...expectedResponseBody } = loginResult;
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				statusCode: 200,
				message: "Login successful.",
				data: expectedResponseBody,
			}),
		);
	});
});
