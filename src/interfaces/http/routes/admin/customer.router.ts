import { container, TYPES } from "@config/di/index.ts";
import type { AdminCustomerController } from "@interfaces/http/controllers/admin/customer.controller.ts";
import { adminAuthMiddleware } from "@interfaces/http/middlewares/admin.auth.middleware.ts";
import { getCustomerDetailsSchema } from "@interfaces/http/validators/customer-details.validate.ts";
import { validateRequestParams } from "@interfaces/http/validators/validate-request.middleware.ts";
import { Router } from "express";

const router = Router();

const adminCustomerController = container.get<AdminCustomerController>(
	TYPES.AdminCustomerController,
);

router.get(
	"/:id",
	adminAuthMiddleware,
	validateRequestParams(getCustomerDetailsSchema),
	adminCustomerController.getCustomerDetails,
);

export default router;
