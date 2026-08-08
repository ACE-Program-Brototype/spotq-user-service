import { BullMQService } from "@infrastructure/queue/bullmq.service.js";
import type { PrismaClient } from "@prisma/client";
import type { RedisClientType } from "redis";

export enum HealthStatus {
	UP = "UP",
	DOWN = "DOWN",
	PONG = "PONG",
}

export interface HealthCheckResult {
	status: HealthStatus.UP | HealthStatus.DOWN;
	timestamp: string;
	checks: {
		application: HealthStatus.UP;
		database: HealthStatus.UP | HealthStatus.DOWN;
		redis: HealthStatus.UP | HealthStatus.DOWN;
		bullmq: HealthStatus.UP | HealthStatus.DOWN;
	};
}

export class HealthService {
	constructor(
		private readonly prisma: PrismaClient,
		private readonly redisClient: RedisClientType,
	) {}

	async check(): Promise<HealthCheckResult> {
		const [dbHealthy, redisHealthy, bullmqHealthy] = await Promise.all([
			this.checkDatabase(),
			this.checkRedis(),
			BullMQService.isHealthy(),
		]);

		const isHealthy = dbHealthy && redisHealthy && bullmqHealthy;
		const status: HealthStatus = isHealthy
			? HealthStatus.UP
			: HealthStatus.DOWN;

		return {
			status,
			timestamp: new Date().toISOString(),
			checks: {
				application: HealthStatus.UP,
				database: dbHealthy ? HealthStatus.UP : HealthStatus.DOWN,
				redis: redisHealthy ? HealthStatus.UP : HealthStatus.DOWN,
				bullmq: bullmqHealthy ? HealthStatus.UP : HealthStatus.DOWN,
			},
		};
	}

	private async checkDatabase(): Promise<boolean> {
		try {
			await this.prisma.$queryRaw`SELECT 1`;
			return true;
		} catch {
			return false;
		}
	}

	private async checkRedis(): Promise<boolean> {
		try {
			const response = await this.redisClient.ping();
			return response === HealthStatus.PONG;
		} catch {
			return false;
		}
	}
}
