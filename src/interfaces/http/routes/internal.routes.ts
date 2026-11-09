import { container, TYPES } from "@config/di/index.ts";
import type { InternalUserAnalyticsRouter } from "@interfaces/http/routes/internal/internal-user-analytics.router.ts";
import { Router } from "express";

const router = Router();

const internalAnalyticsRouter = container.get<InternalUserAnalyticsRouter>(
	TYPES.InternalUserAnalyticsRouter,
);

router.use("/", internalAnalyticsRouter.router);

export default router;
