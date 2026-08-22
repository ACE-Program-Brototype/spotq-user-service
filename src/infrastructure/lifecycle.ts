import type { IEmailService } from "@application/ports/service/IEmail.service.ts";
import { container, TYPES } from "@config/di/index.ts";
import { logger } from "@infrastructure/logger/logger.ts";
import type { PrismaService } from "./database/prisma/database.service.ts";
import type { BullMQService } from "./queue/bullmq.service.ts";
import type { EmailQueueProducer } from "./queue/email.queue.producer.ts";
import type { EmailQueueWorker } from "./queue/email.queue.worker.ts";
import type { RedisService } from "./redis/redis.service.ts";

export async function initInfrastructure(): Promise<void> {
	const prismaService = container.get<PrismaService>(TYPES.PrismaService);
	const redisService = container.get<RedisService>(TYPES.RedisService);
	const bullmqService = container.get<BullMQService>(TYPES.BullMQService);

	await prismaService.connect();
	await redisService.connect();
	await bullmqService.connect();

	// Start BullMQ background worker for email delivery
	try {
		const emailWorker = container.get<EmailQueueWorker>(TYPES.EmailQueueWorker);
		const emailService = container.get<IEmailService>(TYPES.EmailService);
		emailWorker.start(emailService);
		logger.info("BullMQ EmailQueueWorker started");
	} catch (workerErr) {
		logger.warn({ err: workerErr }, "Could not start BullMQ EmailQueueWorker");
	}
}

export async function shutdownInfrastructure(): Promise<void> {
	const prismaService = container.get<PrismaService>(TYPES.PrismaService);
	const redisService = container.get<RedisService>(TYPES.RedisService);
	const bullmqService = container.get<BullMQService>(TYPES.BullMQService);

	try {
		const emailWorker = container.get<EmailQueueWorker>(TYPES.EmailQueueWorker);
		await emailWorker.close();
		logger.info("BullMQ EmailQueueWorker stopped");
	} catch (err) {
		logger.error(err, "Error closing BullMQ EmailQueueWorker");
	}

	try {
		const emailProducer = container.get<EmailQueueProducer>(
			TYPES.EmailQueueProducer,
		);
		await emailProducer.close();
		logger.info("BullMQ EmailQueueProducer closed");
	} catch (err) {
		logger.error(err, "Error closing BullMQ EmailQueueProducer");
	}

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
