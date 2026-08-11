import { config } from "@config/env.js";
import { logger } from "@infrastructure/logger/index.js";
import { HttpStatus, ResponseMessage } from "@shared/constants/index.js";
import { ApiResponse } from "@shared/response/index.js";
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

	const isProduction = config.server.nodeEnv === "production";
	const message = isProduction ? ResponseMessage.UNEXPECTED_ERROR : err.message;
	// In production, omit the short error label for 5xx to avoid leaking internals.
	const errorLabel =
		isProduction && statusCode >= 500
			? undefined
			: ResponseMessage.INTERNAL_SERVER_ERROR;

	const response = ApiResponse.fail(message, statusCode, errorLabel);
	res.status(response.statusCode).json(response);
}
