import { config } from "@config/index.js";
import { PrismaService } from "@infrastructure/database/prisma/database.service.js";
import { logger } from "@infrastructure/logger/logger.js";
import { BullMQService } from "@infrastructure/queue/bullmq.service.js";
import { RedisService } from "@infrastructure/redis/redis.service.js";
import app from "./app.js";

const PORT = config.server.port;

async function bootstrap() {
	await PrismaService.connect();
	await RedisService.connect();

	try {
		await BullMQService.connect();
	} catch (error) {
		logger.error(
			{ err: error },
			"Failed to initialize BullMQ infrastructure. Shutting down...",
		);
		process.exit(1);
	}

	const server = app.listen(PORT, () =>
		logger.info(`User service running on port: ${PORT}`),
	);

	const shutdown = async () => {
		logger.info("Gracefully shutting down...");

		await PrismaService.disconnect();
		await RedisService.disconnect();
		await BullMQService.disconnect();

		server.close(() => {
			logger.info("Graceful shutdown completed");
			process.exit(0);
		});
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
}

bootstrap().catch((err) => {
	logger.error(err, "Failed to start server:");
	process.exit(1);
});
