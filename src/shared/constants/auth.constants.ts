export const authConstants = {
	INVALID_EMAIL: "Invalid email address",
	ADMIN_PASSWORD_TOO_SHORT: "Password must be at least 15 characters long",
	PASSWORD_TOO_SHORT: "Password must be at least 8 characters long",
	PASSWORD_TOO_LONG: "Password must not exceed 100 characters",
	INVALID_PASSWORD: "Invalid credentials",
	USER_NOT_FOUND: "User not found",
	INCORRECT_PASSWORD: "Incorrect password",
	ADMIN_LOGIN_SUCCESS: "Admin login successful",
	ADMIN_LOGOUT_SUCCESS: "Admin logout successful",
	FORGOT_PASSWORD_VERIFICATION_OTP_SUCCESS:
		"Forgot Password verification OTP send successfully",
	EMAIL_VERIFIED_SUCCESS: "Email verified successfully",
	FORGOT_PASSWORD_VERIFICATION_OTP_RESEND_SUCCESS:
		"Forgot Password verification OTP re-send successfully",
	MISSING_TOKEN: "Token not found",
	INVALID_USER: "Invalid user",
	RESET_PASSWORD_FAILED: "Reset password failed",
	PASSWORD_RESET_SUCCESS: "Password reset Successfully",
	INVALID_CREDENTIALS: "Invalid credentials",
	INVALID_TOKEN: "Invalid token",
	AUTH_HEADER_REQUIRED: "Authorization header with Bearer token is required.",
	INVALID_OR_EXPIRED_TOKEN: "Invalid or expired access token.",
	CUSTOMER_ONLY_ACCESS: "Access restricted to customer accounts only.",
	BEARER_PREFIX: "Bearer ",
	GATEWAY_UNAUTHORIZED:
		"Unauthorized: Missing user authentication from API Gateway.",
	ADMIN_FORBIDDEN: "Forbidden: Access denied. Admin role required.",
};

export const USER_ROLES = {
	CUSTOMER: "customer",
	ADMIN: "admin",
} as const;
