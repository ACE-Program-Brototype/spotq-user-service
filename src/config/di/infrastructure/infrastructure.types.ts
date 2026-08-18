export const INFRASTRUCTURE_TYPES = {
	DatabaseHealthCheckable: Symbol.for("DatabaseHealthCheckable"),
	RedisHealthCheckable: Symbol.for("RedisHealthCheckable"),
	BullMQHealthCheckable: Symbol.for("BullMQHealthCheckable"),
	PrismaService: Symbol.for("PrismaService"),
	RedisService: Symbol.for("RedisService"),
	BullMQService: Symbol.for("BullMQService"),

	// Infrastructure Services
	PasswordHasher: Symbol.for("PasswordHasher"),
	TokenService: Symbol.for("TokenService"),
	OtpService: Symbol.for("OtpService"),
	EmailService: Symbol.for("EmailService"),
	EmailQueueProducer: Symbol.for("EmailQueueProducer"),
	EmailQueueWorker: Symbol.for("EmailQueueWorker"),
} as const;
