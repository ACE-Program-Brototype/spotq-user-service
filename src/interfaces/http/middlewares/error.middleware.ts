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
	[DOMAIN_ERRORS.CODES.CUSTOMER_NOT_FOUND]: HttpStatus.NOT_FOUND,
	[DOMAIN_ERRORS.CODES.OTP_INVALID]: HttpStatus.UNPROCESSABLE_ENTITY,
	[DOMAIN_ERRORS.CODES.OTP_EXPIRED]: HttpStatus.UNPROCESSABLE_ENTITY,
	[DOMAIN_ERRORS.CODES.OTP_MAX_ATTEMPTS_EXCEEDED]:
		HttpStatus.UNPROCESSABLE_ENTITY,
	[DOMAIN_ERRORS.CODES.OTP_ALREADY_USED]: HttpStatus.UNPROCESSABLE_ENTITY,
	[DOMAIN_ERRORS.CODES.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
	[DOMAIN_ERRORS.CODES.FORBIDDEN]: HttpStatus.FORBIDDEN,
	[DOMAIN_ERRORS.CODES.INVALID_TOKEN]: HttpStatus.UNAUTHORIZED,
	[DOMAIN_ERRORS.CODES.EMAIL_NOT_VERIFIED]: HttpStatus.FORBIDDEN,
	[DOMAIN_ERRORS.CODES.EMAIL_ALREADY_VERIFIED]: HttpStatus.BAD_REQUEST,
	[DOMAIN_ERRORS.CODES.WEAK_PASSWORD]: HttpStatus.UNPROCESSABLE_ENTITY,
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
	const path = req.originalUrl || req.url;
	const isProduction = config.server.nodeEnv === "production";

	// --------------------------------------------------
	// 1. Zod validation error
	// --------------------------------------------------

	if (err instanceof ZodError) {
		logger.warn(
			{
				err,
				http: {
					method: req.method,
					path,
					status_code: HttpStatus.BAD_REQUEST,
				},
			},
			"Validation error occurred",
		);

		res.status(HttpStatus.BAD_REQUEST).json({
			success: false,
			message: "Validation failed",
			errors: err.issues,
		});

		return;
	}

	// --------------------------------------------------
	// 2. Domain business error
	// --------------------------------------------------

	if (err instanceof DomainError) {
		const statusCode =
			DOMAIN_ERROR_STATUS_MAP[err.code] || HttpStatus.INTERNAL_SERVER_ERROR;

		logger.warn(
			{
				err,
				http: {
					method: req.method,
					path,
					status_code: statusCode,
				},
			},
			"Domain error occurred",
		);

		const response = ApiResponse.fail(err.message, statusCode, err.code);
		res.status(statusCode).json(response);
		return;
	}

	// --------------------------------------------------
	// 3. Application / Unknown / Server error
	// --------------------------------------------------

	const mappedError = mapErrorToHttp(err);

	const isServerError =
		mappedError.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;

	if (isServerError) {
		logger.error(
			{
				err,
				http: {
					method: req.method,
					path,
					status_code: mappedError.statusCode,
				},
			},
			"Unhandled server error occurred",
		);
	} else {
		logger.warn(
			{
				err,
				http: {
					method: req.method,
					path,
					status_code: mappedError.statusCode,
				},
			},
			"Client error occurred",
		);
	}

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
