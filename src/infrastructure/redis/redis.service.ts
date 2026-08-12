import type { IHealthCheckable } from "@infrastructure/health/health.interface.ts";
import { injectable } from "inversify";
import { redisClient } from "./redis.client.ts";

@injectable()
export class RedisService implements IHealthCheckable {
	async connect(): Promise<void> {
		if (!redisClient.isOpen) {
			await redisClient.connect();
		}

		await redisClient.ping();
	}

	async disconnect(): Promise<void> {
		if (redisClient.isOpen) {
			await redisClient.quit();
		}
	}

	async isHealthy(): Promise<boolean> {
		try {
			await redisClient.ping();
			return true;
		} catch {
			return false;
		}
	}
}
