import { TYPES } from "@config/di/types.ts";
import type { UserAuthController } from "@interfaces/http/controllers/customer/user.auth.controller.ts";
import { authMiddleware } from "@interfaces/http/middlewares/auth.middleware.ts";
import {
	googleAuthSchema,
	logoutSchema,
	registerUserSchema,
	resendEmailOtpSchema,
	validateRequestBody,
	verifyEmailOtpSchema,
} from "@interfaces/http/validators/index.ts";
import { Router } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class UserRouter {
	public router: Router;

	constructor(
		@inject(TYPES.UserAuthController)
		private readonly _userController: UserAuthController,
	) {
		this.router = Router();
		this.registerRoutes();
	}

	private registerRoutes(): void {
		this.router.post(
			"/register",
			validateRequestBody(registerUserSchema),
			this._userController.register,
		);

		this.router.post(
			"/verify-email",
			validateRequestBody(verifyEmailOtpSchema),
			this._userController.verifyEmail,
		);

		this.router.post(
			"/resend-email-otp",
			validateRequestBody(resendEmailOtpSchema),
			this._userController.resendEmailOtp,
		);

		this.router.post(
			"/logout",
			authMiddleware,
			validateRequestBody(logoutSchema),
			this._userController.logout,
		);

		this.router.post(
			"/oauth/google",
			validateRequestBody(googleAuthSchema),
			this._userController.googleAuth,
		);
	}

	public getRouter(): Router {
		return this.router;
	}
}
