import { container, TYPES } from "@config/di/index.ts";
import type { HealthRouter } from "@modules/health/health.routes.ts";
import { Router } from "express";
import { metricsRouter } from "./metrics.routes.ts";
import authRoutes from "./admin/auth.router.ts";

export const router = Router();

const healthRouter = container.get<HealthRouter>(TYPES.HealthRouter);

router.use("/", healthRouter.router);
router.use("/", metricsRouter);
router.use("/auth", authRoutes);