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

	// Repositories
	UserRepository: Symbol.for("UserRepository"),
	RefreshTokenRepository: Symbol.for("RefreshTokenRepository"),
	DeviceRepository: Symbol.for("DeviceRepository"),

	// Infrastructure Services
	PasswordHasher: Symbol.for("PasswordHasher"),
	TokenService: Symbol.for("TokenService"),
	OtpService: Symbol.for("OtpService"),
	EmailService: Symbol.for("EmailService"),
	EmailQueueProducer: Symbol.for("EmailQueueProducer"),
	EmailQueueWorker: Symbol.for("EmailQueueWorker"),

	// Application Use Cases
	RegisterUserUseCase: Symbol.for("RegisterUserUseCase"),
	VerifyEmailOtpUseCase: Symbol.for("VerifyEmailOtpUseCase"),
	ResendEmailOtpUseCase: Symbol.for("ResendEmailOtpUseCase"),
	LogoutUseCase: Symbol.for("LogoutUseCase"),

	// Presentation
	UserController: Symbol.for("UserController"),
	UserRouter: Symbol.for("UserRouter"),
} as const;
