import { container, TYPES } from "@config/di/index.js";
import { logger } from "@infrastructure/logger/logger.js";
import type { PrismaService } from "./database/prisma/database.service.js";
import type { BullMQService } from "./queue/bullmq.service.js";
import type { RedisService } from "./redis/redis.service.js";

export async function initInfrastructure(): Promise<void> {
	const prismaService = container.get<PrismaService>(TYPES.PrismaService);
	const redisService = container.get<RedisService>(TYPES.RedisService);
	const bullmqService = container.get<BullMQService>(TYPES.BullMQService);

	await prismaService.connect();
	await redisService.connect();
	await bullmqService.connect();
}

export async function shutdownInfrastructure(): Promise<void> {
	const prismaService = container.get<PrismaService>(TYPES.PrismaService);
	const redisService = container.get<RedisService>(TYPES.RedisService);
	const bullmqService = container.get<BullMQService>(TYPES.BullMQService);

	try {
		logger.info("Disconnecting database client...");
		await prismaService.disconnect();
		logger.info("Database client disconnected");
	} catch (dbErr) {
		logger.error(dbErr, "Error disconnecting database client");
	}

	try {
		logger.info("Disconnecting Bullmq client...");
		await bullmqService.disconnect();
		logger.info("Bullmq client disconnected");
	} catch (bullmqErr) {
		logger.error(bullmqErr, "Error disconnecting Bullmq client");
	}

	try {
		logger.info("Disconnecting Redis client...");
		await redisService.disconnect();
		logger.info("Redis client disconnected");
	} catch (redisErr) {
		logger.error(redisErr, "Error disconnecting Redis client");
	}
}
