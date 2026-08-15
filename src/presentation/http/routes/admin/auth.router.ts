import { container, TYPES } from "@config/di";
import type { AdminAuthController } from "@presentation/http/controllers/admin/auth.controller";
import { Router } from "express";
import { validate } from "../../middlewares/validate.middlware";
import { loginValidator } from "../../validators/login.validate";

const router = Router();

const adminAuthController = container.get<AdminAuthController>(
	TYPES.AdminAuthController,
);

router.post("/login", validate(loginValidator), adminAuthController.login);

export default router;
