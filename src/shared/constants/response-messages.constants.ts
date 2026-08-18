export const ResponseMessage = {
	INTERNAL_SERVER_ERROR: "Internal Server Error",
	UNEXPECTED_ERROR: "An unexpected error occurred",
	UNHANDLED_APP_ERROR: "Unhandled application error",
	REQ_ROUTE_NOT_FOUND: "Requested route not found",
	UNAUTHORIZED: "Unauthorized",
	FORBIDDEN: "Forbidden",
	NOT_FOUND: "Resource not found",
	BAD_REQUEST: "Bad request",
	REGISTRATION_SUCCESS: "Registration successful. A verification OTP has been queued for delivery to your email.",
	EMAIL_VERIFIED: "Email verified successfully.",
	OTP_RESENT: "Verification OTP resent successfully.",
	LOGOUT_SUCCESS: "Logged out successfully.",
} as const;
