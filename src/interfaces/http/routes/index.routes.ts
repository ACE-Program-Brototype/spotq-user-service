import { healthRouter } from "@modules/health/health.routes.js";
import { Router } from "express";
import { metricsRouter } from "./metrics.routes.js";

export const router = Router();

router.use("/", healthRouter);
router.use("/", metricsRouter);
