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
	readonly code = "INVALID_NAME";
	readonly statusCode = 422;

	constructor(message = "Invalid full name provided.") {
		super(message);
	}
}

export class InvalidEmailError extends DomainError {
	readonly code = "INVALID_EMAIL";
	readonly statusCode = 422;

	constructor(message = "Invalid email address provided.") {
		super(message);
	}
}

export class InvalidPhoneNumberError extends DomainError {
	readonly code = "INVALID_PHONE_NUMBER";
	readonly statusCode = 422;

	constructor(message = "Invalid Indian phone number provided.") {
		super(message);
	}
}

export class InvalidPasswordError extends DomainError {
	readonly code = "INVALID_PASSWORD";
	readonly statusCode = 422;

	constructor(
		message = "Password must be 8-128 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
	) {
		super(message);
	}
}

export class EmailAlreadyExistsError extends DomainError {
	readonly code = "EMAIL_ALREADY_EXISTS";
	readonly statusCode = 409;

	constructor(message = "An account with this email already exists.") {
		super(message);
	}
}

export class PhoneAlreadyExistsError extends DomainError {
	readonly code = "PHONE_ALREADY_EXISTS";
	readonly statusCode = 409;

	constructor(message = "An account with this phone number already exists.") {
		super(message);
	}
}

export class UserNotFoundError extends DomainError {
	readonly code = "USER_NOT_FOUND";
	readonly statusCode = 404;

	constructor(message = "User not found.") {
		super(message);
	}
}

export class InvalidOtpError extends DomainError {
	readonly code = "OTP_INVALID";
	readonly statusCode = 422;

	constructor(message = "Invalid OTP provided.") {
		super(message);
	}
}

export class OtpExpiredError extends DomainError {
	readonly code = "OTP_EXPIRED";
	readonly statusCode = 422;

	constructor(message = "OTP has expired. Please request a new OTP.") {
		super(message);
	}
}

export class OtpMaxAttemptsExceededError extends DomainError {
	readonly code = "OTP_MAX_ATTEMPTS_EXCEEDED";
	readonly statusCode = 422;

	constructor(
		message = "Maximum verification attempts exceeded. Please request a new OTP.",
	) {
		super(message);
	}
}

export class OtpAlreadyUsedError extends DomainError {
	readonly code = "OTP_ALREADY_USED";
	readonly statusCode = 422;

	constructor(message = "OTP has already been used.") {
		super(message);
	}
}

export class UnauthorizedError extends DomainError {
	readonly code = "UNAUTHORIZED";
	readonly statusCode = 401;

	constructor(message = "Unauthorized access.") {
		super(message);
	}
}

export class InvalidTokenError extends DomainError {
	readonly code = "INVALID_TOKEN";
	readonly statusCode = 401;

	constructor(message = "Invalid or revoked token provided.") {
		super(message);
	}
}
