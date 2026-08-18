import { INFRASTRUCTURE_TYPES } from "./infrastructure/infrastructure.types.ts";
import { USER_TYPES } from "./user/user.types.ts";
import { HEALTH_TYPES } from "./health/health.types.ts";

export const TYPES = {
	...INFRASTRUCTURE_TYPES,
	...USER_TYPES,
	...HEALTH_TYPES,
} as const;
