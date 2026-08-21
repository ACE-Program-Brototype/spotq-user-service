import { container, TYPES } from "@config/di";
import type { AdminAuthController } from "@presentation/http/controllers/admin/auth.controller";
import { adminTempTokenCheck } from "@presentation/http/middlewares/admin.auth.middleware";
import {
	forgotPasswordValidate,
	forgotPasswordVerifyValidate,
} from "@presentation/http/validators/forgot-password.validate";
import { passwordValidate } from "@presentation/http/validators/reset.password.validate";
import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { loginValidator } from "../../validators/login.validate";
import { forgotPasswordRateLimit, forgotPasswordResendRateLimit, forgotPasswordVerifyRateLimit } from "@presentation/http/middlewares/rate.limit.middleware";

const router = Router();

const adminAuthController = container.get<AdminAuthController>(
	TYPES.AdminAuthController,
);

router.post("/login", validate(loginValidator), adminAuthController.login);
router.post("/logout", adminAuthController.logout);
router.post(
	"/forgot-password",
	validate(forgotPasswordValidate),
	forgotPasswordRateLimit,
	adminAuthController.forgotPassword,
);
router.post(
	"/forgot-password/verify",
	validate(forgotPasswordVerifyValidate),
	forgotPasswordVerifyRateLimit,
	adminAuthController.forgotPasswordEmailVerify,
);
router.post(
	"/forgot-password/resend-otp",
	validate(forgotPasswordValidate),
	forgotPasswordResendRateLimit,
	adminAuthController.verifyOtpResend,
);
router.post(
	"/reset-password",
	adminTempTokenCheck,
	validate(passwordValidate),
	adminAuthController.resetPassword,
);

export default router;
