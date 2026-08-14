import { TYPES } from "@config/di/types.ts";
import type { UserController } from "@interfaces/http/controllers/user.controller.ts";
import { authMiddleware } from "@interfaces/http/middlewares/auth.middleware.ts";
import {
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
		@inject(TYPES.UserController)
		private readonly userController: UserController,
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

		this.router.post(
			"/logout",
			authMiddleware,
			validateRequestBody(logoutSchema),
			this.userController.logout,
		);
	}

	public getRouter(): Router {
		return this.router;
	}
}
