import "reflect-metadata";
import { PrismaService } from "@infrastructure/database/prisma/database.service.js";
import type {
	IHealthCheckable,
	IHealthService,
} from "@infrastructure/health/health.interface.js";
import { BullMQService } from "@infrastructure/queue/bullmq.service.js";
import { RedisService } from "@infrastructure/redis/redis.service.js";
import { HealthController } from "@modules/health/health.controller.js";
import { HealthRouter } from "@modules/health/health.routes.js";
import { HealthService } from "@modules/health/health.service.js";
import { Container } from "inversify";
import { TYPES } from "./types.js";

const container = new Container({ defaultScope: "Singleton" });

// Infrastructure Services & Health Checkables
container.bind<PrismaService>(TYPES.PrismaService).to(PrismaService);
container
	.bind<IHealthCheckable>(TYPES.DatabaseHealthCheckable)
	.toService(TYPES.PrismaService);

container.bind<RedisService>(TYPES.RedisService).to(RedisService);
container
	.bind<IHealthCheckable>(TYPES.RedisHealthCheckable)
	.toService(TYPES.RedisService);

container.bind<BullMQService>(TYPES.BullMQService).to(BullMQService);
container
	.bind<IHealthCheckable>(TYPES.BullMQHealthCheckable)
	.toService(TYPES.BullMQService);

// Domain / Application Services
container.bind<IHealthService>(TYPES.HealthService).to(HealthService);

// HTTP Controllers & Routers
container.bind<HealthController>(TYPES.HealthController).to(HealthController);
container.bind<HealthRouter>(TYPES.HealthRouter).to(HealthRouter);

export { container };
