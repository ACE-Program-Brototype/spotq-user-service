import pino from "pino";
import { config } from "../../config/env.ts";
import { loggerLocalStorage } from "./logger-context.ts";

export const logger = pino({
	level: config.service.logLevel || "info",
	timestamp: false,
	formatters: {
		level: (label) => {
			return { level: label.toUpperCase() };
		},
	},
	mixin() {
		const store = loggerLocalStorage.getStore();
		return {
			timestamp: new Date().toISOString(),
			...(store
				? { requestId: store.requestId, correlationId: store.correlationId }
				: {}),
		};
	},
	serializers: {
		err: pino.stdSerializers.err,
	},
});
