import { randomUUID } from "node:crypto";
import { logger, loggerLocalStorage } from "@infrastructure/logger/index.ts";
import type { NextFunction, Request, Response } from "express";

export enum RequestHeader {
	CORRELATION_ID = "x-correlation-id",
	REQUEST_ID = "x-request-id",
	USER_AGENT = "user-agent",
}

export function loggerMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const correlationId =
		(req.headers[RequestHeader.CORRELATION_ID] as string) || randomUUID();
	const requestId =
		(req.headers[RequestHeader.REQUEST_ID] as string) || randomUUID();

	res.setHeader(RequestHeader.CORRELATION_ID, correlationId);
	res.setHeader(RequestHeader.REQUEST_ID, requestId);

	const store = { requestId, correlationId };

	loggerLocalStorage.run(store, () => {
		logger.info({
			msg: "Incoming request",
			method: req.method,
			url: req.url,
			ip: req.ip,
			headers: {
				host: req.headers.host,
				userAgent: req.headers[RequestHeader.USER_AGENT],
			},
		});

		const startTime = Date.now();

		res.on("finish", () => {
			const duration = Date.now() - startTime;
			logger.info({
				msg: "Request completed",
				method: req.method,
				url: req.url,
				statusCode: res.statusCode,
				responseTimeMs: duration,
			});
		});

		next();
	});
}
