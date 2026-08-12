import { config } from "@config/env.ts";
import { logger } from "@infrastructure/logger/logger.ts";
import { RedisEvent } from "@shared/constants/redis-events.constants.ts";
import { createClient } from "redis";

const isTls = config.redis.url.startsWith("rediss://");

export const redisClient = createClient({
	url: config.redis.url,
	socket: {
		tls: isTls ? true : undefined,
		reconnectStrategy(retries) {
			if (retries > 10) {
				return new Error("Redis reconnect failed");
			}

			return Math.min(retries * 500, 5000);
		},
	},
});

redisClient.on(RedisEvent.CONNECT, () => {
	logger.info("Connecting to Redis...");
});

redisClient.on(RedisEvent.READY, () => {
	logger.info("Redis connected");
});

redisClient.on(RedisEvent.RECONNECTING, () => {
	logger.info("Redis reconnecting...");
});

redisClient.on(RedisEvent.ERROR, (error) => {
	logger.error("Redis Error:", error);
});
