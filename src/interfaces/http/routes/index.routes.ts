import { container, TYPES } from "@config/di/index.js";
import type { HealthRouter } from "@modules/health/health.routes.js";
import { Router } from "express";
import { metricsRouter } from "./metrics.routes.js";

export const router = Router();

const healthRouter = container.get<HealthRouter>(TYPES.HealthRouter);

router.use("/", healthRouter.router);
router.use("/", metricsRouter);
