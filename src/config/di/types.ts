import { HEALTH_TYPES } from "./health/health.types.ts";
import { INFRASTRUCTURE_TYPES } from "./infrastructure/infrastructure.types.ts";
import { USER_TYPES } from "./user/user.types.ts";

export const TYPES = {
	// AUTH
	AdminAuthRepository: Symbol.for("AdminAuthRepository"),
	AdminLoginUseCase: Symbol.for("AdminLoginUseCase"),
	AdminAuthController: Symbol.for("AdminAuthController"),
	AdminLogoutUseCase: Symbol.for("AdminLogoutUseCase"),
	AdminForgotPasswordUseCase: Symbol.for("AdminForgotPasswordUseCase"),
	AdminForgotPasswordEmailVerifyUseCase: Symbol.for(
		"AdminForgotPasswordEmailVerifyUseCase",
	),
	AdminResetPasswordUseCase: Symbol.for("AdminResetPasswordUseCase"),
	TokenServices: Symbol.for("TokenServices"),
	OtpServices: Symbol.for("OtpServices"),
	EmailQueueProducers: Symbol.for("EmailQueueProducers"),
	RefreshTokenRepositories: Symbol.for("RefreshTokenRepositories"),
	PasswordService: Symbol.for("PasswordService"),
	...INFRASTRUCTURE_TYPES,
	...USER_TYPES,
	...HEALTH_TYPES,
} as const;
