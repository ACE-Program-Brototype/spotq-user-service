export const Routes = {
	HEALTH: "/health",
	METRICS: "/metrics",
} as const;

export const CUSTOMER_ROUTES = {
	PROFILE: "/profile",
	ME: "/me",
} as const;

export const ADMIN_AUTH_ROUTES = {
	LOGIN: "/login",
	REFRESH_TOKEN: "/refresh-token",
	LOGOUT: "/logout",
	FORGOT_PASSWORD: "/forgot-password",
	FORGOT_PASSWORD_VERIFY: "/forgot-password/verify",
	FORGOT_PASSWORD_RESEND_OTP: "/forgot-password/resend-otp",
	RESET_PASSWORD: "/reset-password",
} as const;
