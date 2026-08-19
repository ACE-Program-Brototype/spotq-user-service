import { config } from "@config/env.ts";
import { DomainError } from "@domain/errors/domain.error.ts";
import { logger } from "@infrastructure/logger/index.ts";
import {
	DOMAIN_ERRORS,
	HttpStatus,
	ResponseMessage,
} from "@shared/constants/index.ts";
import { ApiResponse } from "@shared/response/index.ts";
import type { NextFunction, Request, Response } from "express";

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
	INVALID_GOOGLE_TOKEN: HttpStatus.UNAUTHORIZED,
	EMAIL_ALREADY_REGISTERED: HttpStatus.CONFLICT,
	USER_BLOCKED: HttpStatus.FORBIDDEN,
	USER_INACTIVE: HttpStatus.FORBIDDEN,
};

export function errorMiddleware(
	err: Error,
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
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
	const errorLabel =
		isProduction && statusCode >= 500
			? undefined
			: ResponseMessage.INTERNAL_SERVER_ERROR;

	const response = ApiResponse.fail(message, statusCode, errorLabel);
	res.status(response.statusCode).json(response);
}
