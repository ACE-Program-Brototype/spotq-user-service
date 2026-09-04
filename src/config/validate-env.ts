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

	ADMIN_NAME: isTest
		? z.string().default("Test Admin")
		: z.string().min(1, "ADMIN_NAME is required"),
	ADMIN_EMAIL: isTest
		? z.string().default("admin@example.com")
		: z.string().email("ADMIN_EMAIL must be a valid email"),
	ADMIN_PASSWORD: isTest
		? z.string().default("password123")
		: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters"),

	BCRYPT_SALT_ROUNDS: z.coerce.number().min(4).max(16).default(10),

	JWT_ACCESS_SECRET: isTest
		? z.string().default("test_jwt_access_secret_min_16_chars")
		: z.string().min(1, "JWT_ACCESS_SECRET is required"),
	JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

	JWT_ACCESS_PRIVATE_KEY: isTest
		? z.string().min(1, "JWT_ACCESS_PRIVATE_KEY must be required")
		: z.string().min(1, "JWT_ACCESS_PRIVATE_KEY is required"),
	
	JWT_ALGORITHM: z.string().default("RS256"),

	JWT_REFRESH_SECRET: isTest
		? z.string().default("test_jwt_refresh_secret_min_16_chars")
		: z.string().min(1, "JWT_REFRESH_SECRET is required"),
	JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

	JWT_TEMP_SECRET: isTest
		? z.string().default("test_jwt_temp_secret_min_16_chars")
		: z.string().min(1, "JWT_TEMP_SECRET is required"),
	JWT_TEMP_EXPIRES_IN: z.string().default("10m"),

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

	COOKIE_HTTPONLY: z
		.string()
		.transform((val) => val === "true")
		.default(true),
	COOKIE_SECURE: z
		.string()
		.transform((val) => val === "true")
		.default(true),
	COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("strict"),
	COOKIE_REFRESH_MAX_AGE: z.string().default("604800000"),
	COOKIE_TEMP_MAX_AGE: z.string().default("900000"),

	// Rate Limiting Configuration
	RATE_LIMIT_FORGOT_PASSWORD_WINDOW_MS: z.coerce
		.number()
		.positive()
		.default(24 * 60 * 60 * 1000),
	RATE_LIMIT_FORGOT_PASSWORD_MAX: z.coerce.number().positive().default(5),

	RATE_LIMIT_FORGOT_PASSWORD_RESEND_WINDOW_MS: z.coerce
		.number()
		.positive()
		.default(5 * 60 * 1000),
	RATE_LIMIT_FORGOT_PASSWORD_RESEND_MAX: z.coerce
		.number()
		.positive()
		.default(5),

	RATE_LIMIT_FORGOT_PASSWORD_VERIFY_WINDOW_MS: z.coerce
		.number()
		.positive()
		.default(5 * 60 * 1000),
	RATE_LIMIT_FORGOT_PASSWORD_VERIFY_MAX: z.coerce
		.number()
		.positive()
		.default(5),
});

export const validateEnv = () => {
	const normalizedEnv = {
		...process.env,
		NODE_ENV:
			process.env.NODE_ENV === "test" ? "testing" : process.env.NODE_ENV,
	};

	const result = envSchema.safeParse(normalizedEnv);

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
