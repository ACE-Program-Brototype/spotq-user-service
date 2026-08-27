import { TYPES } from "@config/di/types.ts";
import type { UserAuthController } from "@interfaces/http/controllers/customer/user.auth.controller.ts";
import { authMiddleware } from "@interfaces/http/middlewares/auth.middleware.ts";
import {
	googleAuthSchema,
	loginSchema,
	registerUserSchema,
	resendEmailOtpSchema,
	validateRequestBody,
	verifyEmailOtpSchema,
} from "@interfaces/http/validators/index.ts";
import { Router } from "express";
import { inject, injectable } from "inversify";
import { customerTempTokenCheck } from "../middlewares/customer.auth.middleware";
import {
	forgotPasswordRateLimit,
	forgotPasswordResendRateLimit,
	forgotPasswordVerifyRateLimit,
} from "../middlewares/rate.limit.middleware";
import {
	forgotPasswordValidate,
	forgotPasswordVerifyValidate,
} from "../validators/forgot-password.validate";
import { passwordValidate } from "../validators/reset.password.validate";

@injectable()
export class UserRouter {
	public router: Router;

	constructor(
		@inject(TYPES.UserAuthController)
		private readonly userController: UserAuthController,
	) {
		this.router = Router();
		this.registerRoutes();
	}

	private registerRoutes(): void {
		this.router.post(
			"/register",
			validateRequestBody(registerUserSchema),
			this.userController.register,
		);

		this.router.post(
			"/verify-email",
			validateRequestBody(verifyEmailOtpSchema),
			this.userController.verifyEmail,
		);

		this.router.post(
			"/resend-email-otp",
			validateRequestBody(resendEmailOtpSchema),
			this.userController.resendEmailOtp,
		);

		this.router.post("/logout", authMiddleware, this.userController.logout);

		this.router.post(
			"/oauth/google",
			validateRequestBody(googleAuthSchema),
			this.userController.googleAuth,
		);

		this.router.post(
			"/login",
			validateRequestBody(loginSchema),
			this.userController.login,
		);

		this.router.post("/refresh-token", this.userController.refresh);

		this.router.post(
			"/forgot-password",
			validateRequestBody(forgotPasswordValidate),
			forgotPasswordRateLimit,
			this.userController.forgotPassword,
		);

		this.router.post(
			"/forgot-password/verify",
			validateRequestBody(forgotPasswordVerifyValidate),
			forgotPasswordVerifyRateLimit,
			this.userController.forgotPasswordEmailVerify,
		);

		this.router.post(
			"/forgot-password/resend-otp",
			validateRequestBody(forgotPasswordValidate),
			forgotPasswordResendRateLimit,
			this.userController.verifyOtpResend,
		);

		this.router.post(
			"/reset-password",
			customerTempTokenCheck,
			validateRequestBody(passwordValidate),
			this.userController.resetPassword,
		);
	}

	public getRouter(): Router {
		return this.router;
	}
}
