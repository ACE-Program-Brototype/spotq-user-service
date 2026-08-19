import { container, TYPES } from "@config/di";
import type { AdminAuthController } from "@presentation/http/controllers/admin/auth.controller";
import { adminTempTokenCheck } from "@presentation/http/middlewares/admin.auth.middleware";
import {
	forgotPasswordValidate,
	forgotPasswordVerifyValidate,
} from "@presentation/http/validators/forgot-password.validate";
import { passwordValidate } from "@presentation/http/validators/reset.password.validate";
import { Router } from "express";
import { validate } from "../../middlewares/validate.middlware";
import { loginValidator } from "../../validators/login.validate";

const router = Router();

const adminAuthController = container.get<AdminAuthController>(
	TYPES.AdminAuthController,
);

router.post("/login", validate(loginValidator), adminAuthController.login);
router.post("/logout", adminAuthController.logout);
router.post(
	"/forgot-password",
	validate(forgotPasswordValidate),
	adminAuthController.forgotPassword,
);
router.post(
	"/forgot-password/verify",
	validate(forgotPasswordVerifyValidate),
	adminAuthController.forgotPasswordEmailVerify,
);
router.post(
	"/forgot-password/resend-otp",
	validate(forgotPasswordValidate),
	adminAuthController.verifyOtpResend,
);
router.post(
	"/reset-password",
	adminTempTokenCheck,
	validate(passwordValidate),
	adminAuthController.resetPassword,
);

export default router;
