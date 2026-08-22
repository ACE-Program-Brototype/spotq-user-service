import "reflect-metadata";
import { config } from "@config/index.ts";
import {
	initInfrastructure,
	shutdownInfrastructure,
} from "@infrastructure/index.ts";
import { logger } from "@infrastructure/logger/logger.ts";

const PORT = config.server.port;

async function bootstrap() {
	await initInfrastructure();
	const { default: app } = await import("./app.ts");

	const server = app.listen(PORT, () => {
		logger.info(`${config.service.name} running on port ${PORT}`);
	});

	let isShuttingDown = false;

	const shutdown = async (signal: string) => {
		if (isShuttingDown) {
			logger.warn(`Received ${signal} but shutdown is already in progress...`);
			return;
		}
		isShuttingDown = true;
		logger.info(`Received ${signal}. Gracefully shutting down...`);

		// Set a safety timeout of 10 seconds to force-exit if connections hang
		const forceExitTimeout = setTimeout(() => {
			logger.error("Graceful shutdown timed out. Forcing shutdown...");
			shutdownInfrastructure().catch((err) => {
				logger.error(
					err,
					"Error disconnecting external services on forced shutdown",
				);
			});
			process.exit(1);
		}, 10000);

		// Stop accepting new connections
		server.close(async (err) => {
			if (err) {
				logger.error(err, "Error during HTTP server close");
			} else {
				logger.info("HTTP server closed successfully");
			}

			// Disconnect external services after HTTP server finishes processing current requests
			await shutdownInfrastructure();

			clearTimeout(forceExitTimeout);
			logger.info("Graceful shutdown completed");
			process.exit(0);
		});

		// Drop idle Keep-Alive connections so the server can shut down immediately without hanging on inactive clients
		server.closeIdleConnections();
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
}

bootstrap().catch((err) => {
	logger.error(err, "Failed to start server:");
	process.exit(1);
});
