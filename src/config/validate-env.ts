import { z } from "zod";

const isTest =
	process.env.NODE_ENV === "test" || process.env.NODE_ENV === "testing";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "testing", "test", "production"])
		.default("development"),

	PORT: z.coerce.number().positive().default(3000),

	SERVICE_NAME: z.string().min(1).default("spotq-user-service"),

	LOG_LEVEL: z
		.enum(["trace", "debug", "info", "warn", "error", "fatal"])
		.default("info"),

	DATABASE_URL: isTest
		? z
				.string()
				.default("postgresql://postgres:password@localhost:5432/user_db")
		: z.string().min(1, "DATABASE_URL is required"),

	DATABASE_SSL_ENABLED: z
		.string()
		.transform((val) => val === "true")
		.default(false),
	DATABASE_CA_CERT: z.string().optional(),

	REDIS_URL: isTest
		? z.string().default("redis://localhost:6379")
		: z.string().min(1, "REDIS_URL is required"),

	BCRYPT_SALT_ROUNDS: z.coerce.number().min(4).max(16).default(10),

	JWT_ACCESS_SECRET: isTest
		? z.string().default("test_jwt_access_secret_min_16_chars")
		: z.string().min(1, "JWT_ACCESS_SECRET is required"),

	JWT_REFRESH_SECRET: isTest
		? z.string().default("test_jwt_refresh_secret_min_16_chars")
		: z.string().min(1, "JWT_REFRESH_SECRET is required"),

	JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
	JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

	BREVO_API_KEY: isTest
		? z.string().default("test_brevo_api_key")
		: z.string().min(1, "BREVO_API_KEY is required"),

	BREVO_SENDER_EMAIL: isTest
		? z.string().default("no-reply@spotq.com")
		: z.string().email("BREVO_SENDER_EMAIL must be a valid email"),

	BREVO_SENDER_NAME: z.string().default("SpotQ"),
	GOOGLE_CLIENT_ID: isTest
		? z.string().default("test_google_client_id")
		: z.string().min(1, "GOOGLE_CLIENT_ID is required"),

	OTP_TTL_SECONDS: z.coerce.number().positive().default(300),
	OTP_MAX_ATTEMPTS: z.coerce.number().positive().default(5),
});

export const validateEnv = () => {
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		console.error("Invalid environment configuration\n");

		for (const issue of result.error.issues) {
			console.error(`${issue.path.join(".")}: ${issue.message}`);
		}

		process.exit(1);
	}

	return result.data;
};

export type Env = z.infer<typeof envSchema>;
