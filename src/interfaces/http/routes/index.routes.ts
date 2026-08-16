import { container, TYPES } from "@config/di/index.ts";
import type { HealthRouter } from "@modules/health/health.routes.ts";
import { Router } from "express";
import { metricsRouter } from "./metrics.routes.ts";
import type { UserRouter } from "./user.routes.ts";

export const router = Router();

const healthRouter = container.get<HealthRouter>(TYPES.HealthRouter);
const userRouter = container.get<UserRouter>(TYPES.UserRouter);

router.use("/", healthRouter.router);
router.use("/", metricsRouter);
router.use("/", userRouter.router);
