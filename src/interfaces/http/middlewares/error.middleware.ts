import { config } from "@config/env.ts";
import { DomainError } from "@domain/errors";
import { logger } from "@infrastructure/logger/index.ts";
import {
	DOMAIN_ERRORS,
	HttpStatus,
	ResponseMessage,
} from "@shared/constants/index.ts";
import { ApiResponse } from "@shared/response/index.ts";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { mapErrorToHttp } from "../errors/error.mapper";

const DOMAIN_ERROR_STATUS_MAP: Record<string, number> = {
	[DOMAIN_ERRORS.CODES.INVALID_NAME]: HttpStatus.UNPROCESSABLE_ENTITY,
	[DOMAIN_ERRORS.CODES.INVALID_EMAIL]: HttpStatus.UNPROCESSABLE_ENTITY,
	[DOMAIN_ERRORS.CODES.INVALID_PHONE_NUMBER]: HttpStatus.UNPROCESSABLE_ENTITY,
	[DOMAIN_ERRORS.CODES.INVALID_PASSWORD]: HttpStatus.UNPROCESSABLE_ENTITY,
	[DOMAIN_ERRORS.CODES.EMAIL_ALREADY_EXISTS]: HttpStatus.CONFLICT,
	[DOMAIN_ERRORS.CODES.PHONE_ALREADY_EXISTS]: HttpStatus.CONFLICT,
	[DOMAIN_ERRORS.CODES.USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
	[DOMAIN_ERRORS.CODES.OTP_INVALID]: HttpStatus.UNPROCESSABLE_ENTITY,
	[DOMAIN_ERRORS.CODES.OTP_EXPIRED]: HttpStatus.UNPROCESSABLE_ENTITY,
	[DOMAIN_ERRORS.CODES.OTP_MAX_ATTEMPTS_EXCEEDED]:
		HttpStatus.UNPROCESSABLE_ENTITY,
	[DOMAIN_ERRORS.CODES.OTP_ALREADY_USED]: HttpStatus.UNPROCESSABLE_ENTITY,
	[DOMAIN_ERRORS.CODES.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
	[DOMAIN_ERRORS.CODES.INVALID_TOKEN]: HttpStatus.UNAUTHORIZED,
	[DOMAIN_ERRORS.CODES.EMAIL_NOT_VERIFIED]: HttpStatus.FORBIDDEN,
	INVALID_GOOGLE_TOKEN: HttpStatus.UNAUTHORIZED,
	EMAIL_ALREADY_REGISTERED: HttpStatus.CONFLICT,
	USER_BLOCKED: HttpStatus.FORBIDDEN,
	USER_INACTIVE: HttpStatus.FORBIDDEN,
	INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
	ACCOUNT_INACTIVE: HttpStatus.FORBIDDEN,
	ACCOUNT_BLOCKED: HttpStatus.FORBIDDEN,
};

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

	if (err instanceof DomainError) {
		const statusCode =
			DOMAIN_ERROR_STATUS_MAP[err.code] || HttpStatus.INTERNAL_SERVER_ERROR;

		logger.warn(
			{
				errName: err.name,
				errCode: err.code,
				message: err.message,
				statusCode,
				method: req.method,
				url: req.url,
			},
			"Domain error occurred",
		);

		const response = ApiResponse.fail(err.message, statusCode, err.code);
		res.status(statusCode).json(response);
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

	const response = ApiResponse.fail(
		message,
		mappedError.statusCode,
		mappedError.code,
	);

	res.status(mappedError.statusCode).json(response);

	return;
}
