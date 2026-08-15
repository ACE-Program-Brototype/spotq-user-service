import { config } from "@config/env.ts";
import { logger } from "@infrastructure/logger/index.ts";
import { HttpStatus, ResponseMessage } from "@shared/constants/index.ts";
import { ApiResponse } from "@shared/response/index.ts";
import { AppError } from "@shared/util/app.error";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorMiddleware(
	err: Error,
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
	logger.error(
		{
			err,
			method: req.method,
			url: req.url,
		},
		"Unhandled error occurred",
	);

	const isProduction = config.server.nodeEnv === "production";

	// -----------------------------
	// Zod validation error
	// -----------------------------

	if (err instanceof ZodError) {
		const message = err.issues.map((issue) => issue.message).join(", ");

		const response = ApiResponse.fail(
			message,
			HttpStatus.BAD_REQUEST,
			"Validation Error",
		);

		res.status(response.statusCode).json(response);

		return;
	}

	// -----------------------------
	// Application error
	// -----------------------------

	if (err instanceof AppError) {
		const response = ApiResponse.fail(err.message, err.statusCode, err.error);

		res.status(response.statusCode).json(response);

		return;
	}

	// -----------------------------
	// Unknown error
	// -----------------------------

	const statusCode =
		res.statusCode === HttpStatus.OK ||
		res.statusCode === HttpStatus.NOT_MODIFIED
			? HttpStatus.INTERNAL_SERVER_ERROR
			: res.statusCode;

	const message = isProduction ? ResponseMessage.UNEXPECTED_ERROR : err.message;

	const errorLabel =
		isProduction && statusCode >= 500
			? undefined
			: ResponseMessage.INTERNAL_SERVER_ERROR;

	const response = ApiResponse.fail(message, statusCode, errorLabel);

	res.status(response.statusCode).json(response);
}
