import { config } from "@config/env.ts";
import { logger } from "@infrastructure/logger/index.ts";
import { HttpStatus, ResponseMessage } from "@shared/constants/index.ts";
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
		res.status(HttpStatus.BAD_REQUEST).json({
			success: false,
			message: "Validation failed",
			errors: err.issues,
		});

		return;
	}

	// -----------------------------
	// Application error
	// -----------------------------

	if (err instanceof AppError) {
		const statusCode = err.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;

		const isServerError = statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;

		// Operational 4xx errors are safe to expose.
		// 5xx errors may contain internal implementation details,
		// so they are masked in production.
		const message =
			isProduction && isServerError
				? ResponseMessage.UNEXPECTED_ERROR
				: err.message;

		const errorLabel = isServerError
			? ResponseMessage.INTERNAL_SERVER_ERROR
			: undefined;

		res.status(statusCode).json({
			success: false,
			message,
			error: errorLabel,
		});

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

	res.status(statusCode).json({
		success: false,
		message,
		error: ResponseMessage.INTERNAL_SERVER_ERROR,
	});
}
