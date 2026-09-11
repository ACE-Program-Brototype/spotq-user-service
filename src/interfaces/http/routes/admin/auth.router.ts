import { container, TYPES } from "@config/di";
import type { AdminAuthController } from "@interfaces/http/controllers/admin/auth.controller";
import { adminTempTokenCheck } from "@interfaces/http/middlewares/admin.auth.middleware";
import {
	forgotPasswordRateLimit,
	forgotPasswordResendRateLimit,
	forgotPasswordVerifyRateLimit,
} from "@interfaces/http/middlewares/rate.limit.middleware";
import {
	forgotPasswordValidate,
	forgotPasswordVerifyValidate,
} from "@interfaces/http/validators/forgot-password.validate";
import { adminPasswordValidate } from "@interfaces/http/validators/reset.password.validate";
import { ADMIN_AUTH_ROUTES } from "@shared/constants/routes.constants.ts";
import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { loginValidator } from "../../validators/login.validate";

const router = Router();

const adminAuthController = container.get<AdminAuthController>(
	TYPES.AdminAuthController,
);

router.post(
	ADMIN_AUTH_ROUTES.LOGIN,
	validate(loginValidator),
	adminAuthController.login,
);
router.post(ADMIN_AUTH_ROUTES.REFRESH_TOKEN, adminAuthController.refreshToken);
router.post(ADMIN_AUTH_ROUTES.LOGOUT, adminAuthController.logout);
router.post(
	ADMIN_AUTH_ROUTES.FORGOT_PASSWORD,
	validate(forgotPasswordValidate),
	forgotPasswordRateLimit,
	adminAuthController.forgotPassword,
);
router.post(
	ADMIN_AUTH_ROUTES.FORGOT_PASSWORD_VERIFY,
	validate(forgotPasswordVerifyValidate),
	forgotPasswordVerifyRateLimit,
	adminAuthController.forgotPasswordEmailVerify,
);
router.post(
	ADMIN_AUTH_ROUTES.FORGOT_PASSWORD_RESEND_OTP,
	validate(forgotPasswordValidate),
	forgotPasswordResendRateLimit,
	adminAuthController.verifyOtpResend,
);
router.post(
	ADMIN_AUTH_ROUTES.RESET_PASSWORD,
	adminTempTokenCheck,
	validate(adminPasswordValidate),
	adminAuthController.resetPassword,
);

export default router;
