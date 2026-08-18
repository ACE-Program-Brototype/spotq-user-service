import {
	InjectBullMQHealth,
	InjectDatabaseHealth,
	InjectRedisHealth,
} from "@config/di/decorators.ts";
import type {
	HealthCheckResult,
	IHealthCheckable,
	IHealthService,
} from "@infrastructure/health/health.interface.ts";
import { HealthStatus } from "@shared/constants/health-status.constants.ts";
import { injectable } from "inversify";

@injectable()
export class HealthService implements IHealthService {
	constructor(
		@InjectDatabaseHealth()
		private readonly _databaseHealth: IHealthCheckable,
		@InjectRedisHealth()
		private readonly _redisHealth: IHealthCheckable,
		@InjectBullMQHealth()
		private readonly _bullmqHealth: IHealthCheckable,
	) {}

	async check(): Promise<HealthCheckResult> {
		const [dbHealthy, redisHealthy, bullmqHealthy] = await Promise.all([
			this._databaseHealth.isHealthy(),
			this._redisHealth.isHealthy(),
			this._bullmqHealth.isHealthy(),
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
