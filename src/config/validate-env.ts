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

	REDIS_URL: z.url(),
	ADMIN_NAME: z.string().min(1),
	ADMIN_EMAIL: z.string().email(),
	ADMIN_PASSWORD: z.string().min(8),
	JWT_ACCESS_SECRET: z.string().min(1),
	JWT_ACCESS_EXPIRES_IN: z.string().min(1),
	JWT_REFRESH_SECRET: z.string().min(1),
	JWT_REFRESH_EXPIRES_IN: z.string().min(1),
	COOKIE_HTTPONLY: z
		.string()
		.transform((val) => val === "true")
		.default(true),
	COOKIE_SECURE: z
		.string()
		.transform((val) => val === "true")
		.default(true),
	COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("strict"),
	COOKIE_REFRESH_MAX_AGE: z.string(),
	COOKIE_TEMP_MAX_AGE: z.string(),

	JWT_TEMP_SECRET: z.string().min(1),
	JWT_TEMP_EXPIRES_IN: z.string().min(1),

	BREVO_API_KEY: z.string().min(1, "BREVO_API_KEY is required"),
	BREVO_SENDER_EMAIL: z
		.string()
		.email("BREVO_SENDER_EMAIL must be a valid email"),
	BREVO_SENDER_NAME: z.string().default("SpotQ"),
	BCRYPT_SALT_ROUNDS: z.coerce.number().min(4).max(16).default(10),
	OTP_TTL_SECONDS: z.coerce.number().positive().default(300),
	OTP_MAX_ATTEMPTS: z.coerce.number().positive().default(5),
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
