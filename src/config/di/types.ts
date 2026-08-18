export const TYPES = {
	DatabaseHealthCheckable: Symbol.for("DatabaseHealthCheckable"),
	RedisHealthCheckable: Symbol.for("RedisHealthCheckable"),
	BullMQHealthCheckable: Symbol.for("BullMQHealthCheckable"),
	PrismaService: Symbol.for("PrismaService"),
	RedisService: Symbol.for("RedisService"),
	BullMQService: Symbol.for("BullMQService"),
	HealthService: Symbol.for("HealthService"),
	HealthController: Symbol.for("HealthController"),
	HealthRouter: Symbol.for("HealthRouter"),

	// AUTH
	AdminAuthRepository: Symbol.for("AdminAuthRepository"),
	AdminLoginUseCase: Symbol.for("AdminLoginUseCase"),
	AdminAuthController: Symbol.for("AdminAuthController"),
	RefreshTokenRepository: Symbol.for("RefreshTokenRepository"),
	AdminLogoutUseCase: Symbol.for("AdminLogoutUseCase"),
	OtpService: Symbol.for("OtpService"),
	EmailQueueProducer: Symbol.for("EmailQueueProducer"),
	AdminForgotPasswordUseCase: Symbol.for("AdminForgotPasswordUseCase"),
	EmailService: Symbol.for("EmailService"),
	EmailQueueWorker: Symbol.for("EmailQueueWorker"),
	AdminForgotPasswordEmailVerifyUseCase: Symbol.for("AdminForgotPasswordEmailVerifyUseCase")

} as const;
