import type { IHealthService } from "@infrastructure/health/health.interface.ts";
import { HealthController } from "@modules/health/health.controller.ts";
import { HealthRouter } from "@modules/health/health.routes.ts";
import { HealthService } from "@modules/health/health.service.ts";
import { ContainerModule } from "inversify";
import { HEALTH_TYPES } from "./health.types.ts";

export const healthModule = new ContainerModule(({ bind }) => {
	// Domain / Health Services
	bind<IHealthService>(HEALTH_TYPES.HealthService).to(HealthService);

	// HTTP Controllers & Routers
	bind<HealthController>(HEALTH_TYPES.HealthController).to(HealthController);
	bind<HealthRouter>(HEALTH_TYPES.HealthRouter).to(HealthRouter);
});
