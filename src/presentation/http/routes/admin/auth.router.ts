import { container, TYPES } from "@config/di";
import type { AdminAuthController } from "@presentation/http/controllers/admin/auth.controller";
import { Router } from "express";
import { validate } from "../../middlewares/validate.middlware";
import { loginValidator } from "../../validators/login.validate";
import { forgotPasswordValidate, forgotPasswordVerifyValidate } from "@presentation/http/validators/forgot-password.validate";

const router = Router();

const adminAuthController = container.get<AdminAuthController>(
	TYPES.AdminAuthController,
);

router.post("/login", validate(loginValidator), adminAuthController.login);
router.post("/logout", adminAuthController.logout);
router.post("/forgot-password", validate(forgotPasswordValidate), adminAuthController.forgotPassword)
router.post("/forgot-password/verify", validate(forgotPasswordVerifyValidate), adminAuthController.forgotPasswordEmailVerify)

export default router;
