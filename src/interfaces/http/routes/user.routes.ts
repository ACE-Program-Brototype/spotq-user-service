import { TYPES } from "@config/di/types.ts";
import type { ICustomerAdminController } from "@interfaces/http/controllers/admin/customer-admin.controller.interface.ts";
import type { ICustomerProfileController } from "@interfaces/http/controllers/customer/customer-profile.controller.interface.ts";
import type { IUserAuthController } from "@interfaces/http/controllers/customer/user.auth.controller.interface.ts";
import { adminAuthMiddleware } from "@interfaces/http/middlewares/admin.auth.middleware.ts";
import { authMiddleware } from "@interfaces/http/middlewares/auth.middleware.ts";
import {
	googleAuthSchema,
	listCustomersQuerySchema,
	loginSchema,
	registerUserSchema,
	resendEmailOtpSchema,
	updateCustomerProfileSchema,
	updateCustomerStatusParamsSchema,
	updateCustomerStatusSchema,
	validateRequestBody,
	validateRequestParams,
	validateRequestQuery,
	verifyEmailOtpSchema,
} from "@interfaces/http/validators/index.ts";
import {
	ADMIN_ROUTES,
	AUTH_ROUTES,
	CUSTOMER_ROUTES,
} from "@shared/constants/routes.constants.ts";
import { Router } from "express";
import { inject, injectable } from "inversify";
import { customerTempTokenCheck } from "../middlewares/customer.auth.middleware";
import {
	forgotPasswordRateLimit,
	forgotPasswordResendRateLimit,
	forgotPasswordVerifyRateLimit,
	resendEmailOtpRateLimit,
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
		private readonly userController: IUserAuthController,
		@inject(TYPES.CustomerProfileController)
		private readonly profileController: ICustomerProfileController,
		@inject(TYPES.CustomerAdminController)
		private readonly customerAdminController: ICustomerAdminController,
	) {
		this.router = Router();
		this.registerRoutes();
	}

	private registerRoutes(): void {
		this.router.get(
			ADMIN_ROUTES.ROOT,
			adminAuthMiddleware,
			validateRequestQuery(listCustomersQuerySchema),
			this.customerAdminController.listCustomers,
		);

		this.router.get(
			ADMIN_ROUTES.USERS,
			adminAuthMiddleware,
			validateRequestQuery(listCustomersQuerySchema),
			this.customerAdminController.listCustomers,
		);

		this.router.patch(
			ADMIN_ROUTES.USER_STATUS,
			adminAuthMiddleware,
			validateRequestParams(updateCustomerStatusParamsSchema),
			validateRequestBody(updateCustomerStatusSchema),
			this.customerAdminController.updateCustomerStatus,
		);

		this.router.patch(
			ADMIN_ROUTES.USERS_USER_STATUS,
			adminAuthMiddleware,
			validateRequestParams(updateCustomerStatusParamsSchema),
			validateRequestBody(updateCustomerStatusSchema),
			this.customerAdminController.updateCustomerStatus,
		);

		this.router.get(
			CUSTOMER_ROUTES.PROFILE,
			authMiddleware,
			this.profileController.getProfile,
		);

		this.router.patch(
			CUSTOMER_ROUTES.PROFILE,
			authMiddleware,
			validateRequestBody(updateCustomerProfileSchema),
			this.profileController.updateProfile,
		);

		this.router.get(
			CUSTOMER_ROUTES.ME,
			authMiddleware,
			this.profileController.getProfile,
		);

		this.router.post(
			AUTH_ROUTES.REGISTER,
			validateRequestBody(registerUserSchema),
			this.userController.register,
		);

		this.router.post(
			AUTH_ROUTES.VERIFY_EMAIL,
			validateRequestBody(verifyEmailOtpSchema),
			this.userController.verifyEmail,
		);

		this.router.post(
			AUTH_ROUTES.RESEND_EMAIL_OTP,
			validateRequestBody(resendEmailOtpSchema),
			resendEmailOtpRateLimit,
			this.userController.resendEmailOtp,
		);

		this.router.post(
			AUTH_ROUTES.EMAIL_VERIFICATION_RESEND,
			validateRequestBody(resendEmailOtpSchema),
			resendEmailOtpRateLimit,
			this.userController.resendEmailOtp,
		);

		this.router.post(
			AUTH_ROUTES.LOGOUT,
			authMiddleware,
			this.userController.logout,
		);

		this.router.post(
			AUTH_ROUTES.GOOGLE_OAUTH,
			validateRequestBody(googleAuthSchema),
			this.userController.googleAuth,
		);

		this.router.post(
			AUTH_ROUTES.LOGIN,
			validateRequestBody(loginSchema),
			this.userController.login,
		);

		this.router.post(AUTH_ROUTES.REFRESH_TOKEN, this.userController.refresh);

		this.router.post(
			AUTH_ROUTES.FORGOT_PASSWORD,
			validateRequestBody(forgotPasswordValidate),
			forgotPasswordRateLimit,
			this.userController.forgotPassword,
		);

		this.router.post(
			AUTH_ROUTES.FORGOT_PASSWORD_VERIFY,
			validateRequestBody(forgotPasswordVerifyValidate),
			forgotPasswordVerifyRateLimit,
			this.userController.forgotPasswordEmailVerify,
		);

		this.router.post(
			AUTH_ROUTES.FORGOT_PASSWORD_RESEND_OTP,
			validateRequestBody(forgotPasswordValidate),
			forgotPasswordResendRateLimit,
			this.userController.verifyOtpResend,
		);

		this.router.post(
			AUTH_ROUTES.RESET_PASSWORD,
			customerTempTokenCheck,
			validateRequestBody(passwordValidate),
			this.userController.resetPassword,
		);
	}

	public getRouter(): Router {
		return this.router;
	}
}
