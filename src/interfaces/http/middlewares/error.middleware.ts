import { config } from "@config/env.js";
import { logger } from "@infrastructure/logger/index.js";
import { HttpStatus } from "@shared/constants/http.constants.js";
import { ResponseMessage } from "@shared/constants/response-messages.constants.js";
import type { NextFunction, Request, Response } from "express";

export function errorMiddleware(
	err: Error,
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
	logger.error(
		{ err, method: req.method, url: req.url },
		"Unhandled error occurred",
	);

	const statusCode =
		res.statusCode === HttpStatus.OK ||
		res.statusCode === HttpStatus.NOT_MODIFIED
			? HttpStatus.INTERNAL_SERVER_ERROR
			: res.statusCode;

	res.status(statusCode).json({
		error: ResponseMessage.INTERNAL_SERVER_ERROR,
		message:
			config.server.nodeEnv === "production"
				? ResponseMessage.UNEXPECTED_ERROR
				: err.message,
	});
}
