import { config } from "@config/env.ts";
import type { IHealthCheckable } from "@infrastructure/health/health.interface.ts";
import { BullMQEvent } from "@shared/constants/bullmq-events.constants.ts";
import { HealthStatus } from "@shared/constants/health-status.constants.ts";
import { injectable } from "inversify";
import { Redis, type RedisOptions } from "ioredis";
import { logger } from "../logger/index.ts";
import { bullmqConnection } from "./bullmq.client.ts";

@injectable()
export class BullMQService implements IHealthCheckable {
	private client: Redis | null = null;

	async connect(): Promise<void> {
		if (this.client) {
			return;
		}

		try {
			// Instantiate dedicated ioredis client using the url and connection options
			this.client = new Redis(
				config.redis.url,
				bullmqConnection as RedisOptions,
			);

			this.client.on(BullMQEvent.ERROR, (err) => {
				logger.error({ err }, "BullMQ Redis Connection Error");
			});

			// Validate connection
			await this.client.ping();
			logger.info("BullMQ Connected");
		} catch (error) {
			logger.error({ err: error }, "BullMQ Connection Failed");
			if (this.client) {
				this.client.disconnect();
				this.client = null;
			}
			throw error;
		}
	}

	async disconnect(): Promise<void> {
		if (this.client) {
			try {
				await this.client.quit();
				logger.info("BullMQ Disconnected");
			} catch (error) {
				logger.error({ err: error }, "BullMQ Disconnect Error");
			} finally {
				this.client = null;
			}
		}
	}

	async isHealthy(): Promise<boolean> {
		if (!this.client) {
			return false;
		}

		try {
			const status = await this.client.ping();
			return status === HealthStatus.PONG;
		} catch {
			return false;
		}
	}
}
