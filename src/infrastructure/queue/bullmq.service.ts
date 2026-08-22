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
	private _client: Redis | null = null;

	async connect(): Promise<void> {
		if (this._client) {
			return;
		}

		try {
			// Instantiate dedicated ioredis client using the url and connection options
			this._client = new Redis(
				config.redis.url,
				bullmqConnection as RedisOptions,
			);

			this._client.on(BullMQEvent.ERROR, (err) => {
				logger.error({ err }, "BullMQ Redis Connection Error");
			});

			// Validate connection
			await this._client.ping();
			logger.info("BullMQ Connected");
		} catch (error) {
			logger.error({ err: error }, "BullMQ Connection Failed");
			if (this._client) {
				this._client.disconnect();
				this._client = null;
			}
			throw error;
		}
	}

	async disconnect(): Promise<void> {
		if (this._client) {
			try {
				await this._client.quit();
				logger.info("BullMQ Disconnected");
			} catch (error) {
				logger.error({ err: error }, "BullMQ Disconnect Error");
			} finally {
				this._client = null;
			}
		}
	}

	async isHealthy(): Promise<boolean> {
		if (!this._client) {
			return false;
		}

		try {
			const status = await this._client.ping();
			return status === HealthStatus.PONG;
		} catch {
			return false;
		}
	}
}
