import { config } from "@config/env.ts";
import { logger } from "@infrastructure/logger/index.ts";
import { HttpStatus, ResponseMessage } from "@shared/constants/index.ts";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { mapErrorToHttp } from "../errors/error.mapper";

export function errorMiddleware(
	err: unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
	// --------------------------------------------------
	// 1. Always log the original error
	// --------------------------------------------------

	logger.error(
		{
			err,
			method: req.method,
			url: req.url,
		},
		"Unhandled error occurred",
	);

	const isProduction = config.server.nodeEnv === "production";

	// --------------------------------------------------
	// 2. Zod validation error
	// --------------------------------------------------

	if (err instanceof ZodError) {
		res.status(HttpStatus.BAD_REQUEST).json({
			success: false,
			message: "Validation failed",
			errors: err.issues,
		});

		return;
	}

	// --------------------------------------------------
	// 3. Domain / Application / Unknown error
	// --------------------------------------------------

	const mappedError = mapErrorToHttp(err);

	const isServerError =
		mappedError.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;

	// Never expose internal 5xx error details in production.
	const message =
		isProduction && isServerError
			? ResponseMessage.UNEXPECTED_ERROR
			: mappedError.message;

	res.status(mappedError.statusCode).json({
		success: false,
		code: mappedError.code,
		message,
	});

	return;
}
