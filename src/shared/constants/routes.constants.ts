export const Routes = {
	HEALTH: "/health",
	METRICS: "/metrics",
} as const;

export const CUSTOMER_ROUTES = {
	PROFILE: "/profile",
	ME: "/me",
} as const;

export const ADMIN_ROUTES = {
	USERS: "/users",
	CUSTOMERS: "/customers",
	USER_STATUS: "/:userId/status",
	USERS_USER_STATUS: "/users/:userId/status",
} as const;

export const USER_ROUTES = {
	USERS: "/users",
} as const;
