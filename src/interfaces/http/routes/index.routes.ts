import { HealthRouter } from "@modules/health/health.routes.js";
import { Router } from "express";
import { metricsRouter } from "./metrics.routes.js";

export const router = Router();

const healthRouter = new HealthRouter();

router.use("/", healthRouter.router);
router.use("/", metricsRouter);
