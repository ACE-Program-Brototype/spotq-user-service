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
} as const;
