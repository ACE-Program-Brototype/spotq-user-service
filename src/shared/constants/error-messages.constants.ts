export const VALUE_OBJECT_ERRORS = {
	EMAIL: {
		TYPE: "Email must be a string.",
		LENGTH: "Invalid email length.",
		FORMAT: "Invalid email format.",
	},
	FULL_NAME: {
		TYPE: "Full name must be a string.",
		LENGTH: "Full name must be between 2 and 100 characters.",
		CONTROL_CHARS: "Full name must not contain control characters.",
		FORMAT:
			"Full name can only contain letters, spaces, hyphens, and apostrophes.",
	},
	PASSWORD: {
		TYPE: "Password must be a string.",
		WHITESPACE: "Password must not contain leading or trailing whitespace.",
		LENGTH: "Password must be between 8 and 128 characters long.",
		STRENGTH:
			"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
	},
	PHONE: {
		TYPE: "Phone number must be a string.",
		EMPTY: "Phone number cannot be empty.",
		REGION: "Phone number must start with +91 (Indian numbers only).",
		FORMAT:
			"Invalid Indian mobile number format. Expected +91 followed by 10 digits.",
	},
};

export const DOMAIN_ERRORS = {
	CODES: {
		INVALID_NAME: "INVALID_NAME",
		INVALID_EMAIL: "INVALID_EMAIL",
		INVALID_PHONE_NUMBER: "INVALID_PHONE_NUMBER",
		INVALID_PASSWORD: "INVALID_PASSWORD",
		EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
		PHONE_ALREADY_EXISTS: "PHONE_ALREADY_EXISTS",
		USER_NOT_FOUND: "USER_NOT_FOUND",
		OTP_INVALID: "OTP_INVALID",
		OTP_EXPIRED: "OTP_EXPIRED",
		OTP_MAX_ATTEMPTS_EXCEEDED: "OTP_MAX_ATTEMPTS_EXCEEDED",
		OTP_ALREADY_USED: "OTP_ALREADY_USED",
		UNAUTHORIZED: "UNAUTHORIZED",
		INVALID_TOKEN: "INVALID_TOKEN",
		EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
	},
	MESSAGES: {
		INVALID_NAME: "Invalid full name provided.",
		INVALID_EMAIL: "Invalid email address provided.",
		INVALID_PHONE_NUMBER: "Invalid Indian phone number provided.",
		INVALID_PASSWORD:
			"Password must be 8-128 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
		EMAIL_ALREADY_EXISTS: "An account with this email already exists.",
		EMAIL_NOT_VERIFIED:
			"Email is not verified. Please verify your email first.",
		PHONE_ALREADY_EXISTS: "An account with this phone number already exists.",
		USER_NOT_FOUND: "User not found.",
		OTP_INVALID: "Invalid OTP provided.",
		OTP_EXPIRED: "OTP has expired. Please request a new OTP.",
		OTP_MAX_ATTEMPTS_EXCEEDED:
			"Maximum verification attempts exceeded. Please request a new OTP.",
		OTP_ALREADY_USED: "OTP has already been used.",
		UNAUTHORIZED: "Unauthorized access.",
		INVALID_TOKEN: "Invalid or revoked token provided.",
	},
};

export const RATE_LIMIT_ERRORS = {
	FORGOT_PASSWORD:
		"Too many password reset requests. Please try again after 24 hours.",
	FORGOT_PASSWORD_RESEND:
		"Too many OTP resend requests. Please try again after 5 minutes.",
	FORGOT_PASSWORD_VERIFY:
		"Too many OTP verification attempts. Please try again after 5 minutes.",
} as const;
