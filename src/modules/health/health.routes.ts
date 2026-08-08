import { prisma } from "@infrastructure/database/prisma/prisma.js";
import { redisClient } from "@infrastructure/redis/redis.client.js";
import { Router } from "express";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

const healthService = new HealthService(prisma, redisClient);
const healthController = new HealthController(healthService);

export class HealthRouter {
	public router: Router;
	constructor() {
		this.router = Router();
		this.init();
	}

	private init() {
		this.router.get("/health", healthController.check);
	}
}
