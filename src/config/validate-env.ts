import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "testing", "production"]),

	PORT: z.coerce.number().positive(),

	SERVICE_NAME: z.string().min(1),

	LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]),

	DATABASE_URL: z.url(),
	DATABASE_SSL_ENABLED: z
		.string()
		.transform((val) => val === "true")
		.default(false),
	DATABASE_CA_CERT: z.string().optional(),

	REDIS_URL: z.url(),
	ADMIN_NAME: z.string().min(1),
	ADMIN_EMAIL: z.string().email(),
	ADMIN_PASSWORD: z.string().min(8),
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
