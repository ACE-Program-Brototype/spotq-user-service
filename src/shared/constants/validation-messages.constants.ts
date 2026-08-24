export const VALIDATION_MESSAGES = {
	FULL_NAME: {
		REQUIRED: "Full name is required.",
		MIN: "Full name must be at least 2 characters.",
		MAX: "Full name must not exceed 100 characters.",
		CONTROL_CHARS: "Full name must not contain control characters.",
		FORMAT:
			"Full name can only contain letters, spaces, hyphens, and apostrophes.",
	},
	EMAIL: {
		REQUIRED: "Email is required.",
		FORMAT: "Invalid email address format.",
		MAX: "Email must not exceed 254 characters.",
	},
	PHONE: {
		REQUIRED: "Phone number is required.",
		REGION: "Phone number must start with +91 (Indian numbers only).",
		FORMAT:
			"Invalid Indian mobile number format. Expected +91 followed by 10 digits.",
	},
	PASSWORD: {
		REQUIRED: "Password is required.",
		MIN: "Password must be at least 8 characters.",
		MAX: "Password must not exceed 128 characters.",
		WHITESPACE: "Password must not contain leading or trailing whitespace.",
		UPPERCASE: "Password must contain at least one uppercase letter.",
		LOWERCASE: "Password must contain at least one lowercase letter.",
		NUMBER: "Password must contain at least one number.",
		SPECIAL_CHAR: "Password must contain at least one special character.",
	},
	OTP: {
		REQUIRED: "OTP is required.",
		LENGTH: "OTP must be exactly 6 characters.",
		FORMAT: "OTP must contain only digits.",
	},
	REFRESH_TOKEN: {
		REQUIRED: "Refresh token is required.",
		EMPTY: "Refresh token cannot be empty.",
	},
	GOOGLE: {
		ID_TOKEN_REQUIRED: "Google ID token is required.",
	},
} as const;
