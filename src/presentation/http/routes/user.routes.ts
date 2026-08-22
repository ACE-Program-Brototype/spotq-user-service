import { TYPES } from "@config/di/types.ts";
import type { UserController } from "@interfaces/http/controllers/user.controller.ts";
import { authMiddleware } from "@presentation/http/middlewares/auth.middleware.ts";
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
		private readonly _userController: UserController,
	) {
		this.router = Router();
		this.registerRoutes();
	}

	private registerRoutes(): void {
		this.router.post(
			"/register",
			validateRequestBody(registerUserSchema),
			this._userController.register.bind(this._userController),
		);

		this.router.post(
			"/verify-email",
			validateRequestBody(verifyEmailOtpSchema),
			this._userController.verifyEmail.bind(this._userController),
		);

		this.router.post(
			"/resend-email-otp",
			validateRequestBody(resendEmailOtpSchema),
			this._userController.resendEmailOtp.bind(this._userController),
		);

		this.router.post(
			"/logout",
			authMiddleware,
			validateRequestBody(logoutSchema),
			this._userController.logout.bind(this._userController),
		);
	}

	public getRouter(): Router {
		return this.router;
	}
}
