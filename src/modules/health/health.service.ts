import {
	InjectBullMQHealth,
	InjectDatabaseHealth,
	InjectRedisHealth,
} from "@config/di/decorators.js";
import type {
	HealthCheckResult,
	IHealthCheckable,
	IHealthService,
} from "@infrastructure/health/health.interface.js";
import { HealthStatus } from "@shared/constants/health-status.constants.js";
import { injectable } from "inversify";

@injectable()
export class HealthService implements IHealthService {
	constructor(
		@InjectDatabaseHealth()
		private readonly databaseHealth: IHealthCheckable,
		@InjectRedisHealth()
		private readonly redisHealth: IHealthCheckable,
		@InjectBullMQHealth()
		private readonly bullmqHealth: IHealthCheckable,
	) {}

	async check(): Promise<HealthCheckResult> {
		const [dbHealthy, redisHealthy, bullmqHealthy] = await Promise.all([
			this.databaseHealth.isHealthy(),
			this.redisHealth.isHealthy(),
			this.bullmqHealth.isHealthy(),
		]);

		const isHealthy = Boolean(dbHealthy && redisHealthy && bullmqHealthy);
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
}
