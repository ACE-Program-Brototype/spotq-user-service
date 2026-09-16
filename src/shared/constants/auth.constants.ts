export const authConstants = {
	COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000,
	ACCESS_TOKEN_EXPIRY: "15m",
	REFRESH_TOKEN_EXPIRY: "7d",
	RESET_TOKEN_EXPIRY_MS: 15 * 60 * 1000,
	TOKEN_NAME: "refreshToken",
	USER_LOGGED_IN: "User logged in successfully.",
	USER_LOGGED_OUT: "User logged out successfully.",
	PASSWORD_RESET_EMAIL_SENT:
		"If the email is registered, a password reset link has been sent.",
	PASSWORD_RESET_SUCCESS:
		"Password has been reset successfully. Please log in with your new password.",
	ACCOUNT_NOT_FOUND: "Account not found.",
	USER_NOT_FOUND: "User not found.",
	INVALID_REFRESH_TOKEN: "Invalid refresh token",
	REFRESH_TOKEN_MISSING: "Refresh token missing",
	USER_BLOCKED_OR_INACTIVE: "User is blocked or inactive",
	TOKEN_REFRESH_SUCCESS: "Access token refreshed successfully",
	AUTHENTICATION_FAILED: "Authentication failed",
	ADMIN_LOGGED_IN: "Admin logged in successfully.",
	ADMIN_LOGIN_SUCCESS: "Admin logged in successfully.",
	ADMIN_LOGOUT_SUCCESS: "Admin logged out successfully.",
	FORGOT_PASSWORD_VERIFICATION_OTP_SUCCESS:
		"If the email is registered, a password reset OTP has been sent.",
	FORGOT_PASSWORD_VERIFICATION_OTP_RESEND_SUCCESS:
		"Password reset OTP has been resent successfully.",
	EMAIL_VERIFIED_SUCCESS: "Email verified successfully.",
	INVALID_CREDENTIALS: "Invalid email or password.",
	ADMIN_ACCESS_RESTRICTED: "Access restricted to platform administrators only.",
	INVALID_OR_EXPIRED_TOKEN: "Invalid or expired access token.",
	CUSTOMER_ONLY_ACCESS: "Access restricted to customer accounts only.",
	BEARER_PREFIX: "Bearer ",
	GATEWAY_UNAUTHORIZED:
		"Unauthorized: Missing user authentication from API Gateway.",
	ADMIN_FORBIDDEN: "Forbidden: Access denied. Admin role required.",
};

export const USER_ROLES = {
	ADMIN: "admin",
	PLATFORM_ADMIN: "PLATFORM_ADMIN",
	CUSTOMER: "customer",
	RESTAURANT_ADMIN: "restaurant_admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
