import { container, TYPES } from "@config/di/index.ts";
import adminRoutes from "@interfaces/http/routes/admin.routes.ts";
import type { HealthRouter } from "@modules/health/health.routes.ts";
import { getJwks } from "@shared/util/jwks.util.ts";
import { Router } from "express";
import { metricsRouter } from "./metrics.routes.ts";
import type { UserRouter } from "./user.routes.ts";

export const router = Router();

const healthRouter = container.get<HealthRouter>(TYPES.HealthRouter);
const userRouter = container.get<UserRouter>(TYPES.UserRouter);

// Standard JWKS endpoint for API Gateway / Envoy JWT verification
router.get("/.well-known/jwks.json", (_req, res) => {
	res.status(200).json(getJwks());
});

router.use("/", healthRouter.router);
router.use("/", metricsRouter);
router.use("/admin", adminRoutes);
router.use("/", userRouter.router);
