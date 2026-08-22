import { DOMAIN_ERRORS } from "@shared/constants/index.ts";

export abstract class DomainError extends Error {
	abstract readonly code: string;
	abstract readonly statusCode: number;

	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class InvalidNameError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.INVALID_NAME;
	readonly statusCode = 422;

	constructor(message = DOMAIN_ERRORS.MESSAGES.INVALID_NAME) {
		super(message);
	}
}

export class InvalidEmailError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.INVALID_EMAIL;
	readonly statusCode = 422;

	constructor(message = DOMAIN_ERRORS.MESSAGES.INVALID_EMAIL) {
		super(message);
	}
}

export class InvalidPhoneNumberError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.INVALID_PHONE_NUMBER;
	readonly statusCode = 422;

	constructor(message = DOMAIN_ERRORS.MESSAGES.INVALID_PHONE_NUMBER) {
		super(message);
	}
}

export class InvalidPasswordError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.INVALID_PASSWORD;
	readonly statusCode = 422;

	constructor(message = DOMAIN_ERRORS.MESSAGES.INVALID_PASSWORD) {
		super(message);
	}
}

export class EmailAlreadyExistsError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.EMAIL_ALREADY_EXISTS;
	readonly statusCode = 409;

	constructor(message = DOMAIN_ERRORS.MESSAGES.EMAIL_ALREADY_EXISTS) {
		super(message);
	}
}

export class PhoneAlreadyExistsError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.PHONE_ALREADY_EXISTS;
	readonly statusCode = 409;

	constructor(message = DOMAIN_ERRORS.MESSAGES.PHONE_ALREADY_EXISTS) {
		super(message);
	}
}

export class UserNotFoundError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.USER_NOT_FOUND;
	readonly statusCode = 404;

	constructor(message = DOMAIN_ERRORS.MESSAGES.USER_NOT_FOUND) {
		super(message);
	}
}

export class InvalidOtpError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.OTP_INVALID;
	readonly statusCode = 422;

	constructor(message = DOMAIN_ERRORS.MESSAGES.OTP_INVALID) {
		super(message);
	}
}

export class OtpExpiredError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.OTP_EXPIRED;
	readonly statusCode = 422;

	constructor(message = DOMAIN_ERRORS.MESSAGES.OTP_EXPIRED) {
		super(message);
	}
}

export class OtpMaxAttemptsExceededError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.OTP_MAX_ATTEMPTS_EXCEEDED;
	readonly statusCode = 422;

	constructor(message = DOMAIN_ERRORS.MESSAGES.OTP_MAX_ATTEMPTS_EXCEEDED) {
		super(message);
	}
}

export class OtpAlreadyUsedError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.OTP_ALREADY_USED;
	readonly statusCode = 422;

	constructor(message = DOMAIN_ERRORS.MESSAGES.OTP_ALREADY_USED) {
		super(message);
	}
}

export class UnauthorizedError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.UNAUTHORIZED;
	readonly statusCode = 401;

	constructor(message = DOMAIN_ERRORS.MESSAGES.UNAUTHORIZED) {
		super(message);
	}
}

export class InvalidTokenError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.INVALID_TOKEN;
	readonly statusCode = 401;

	constructor(message = DOMAIN_ERRORS.MESSAGES.INVALID_TOKEN) {
		super(message);
	}
}
