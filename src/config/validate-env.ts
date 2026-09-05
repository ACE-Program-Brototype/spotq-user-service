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

	JWT_PRIVATE_KEY: isTest
		? z
				.string()
				.default(
					"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDNOobBMILddHw0\nMX514JuRJhQ6MxxqTGtvptpxpqhVVEUA9TbHK8qEpof3PxZdjAoffJ58R8ASFpol\n6vbAMwNnUQslwA4ZJDrAGoi9Wnhg6EQ1dWayZUCgyCBWzjtxDlz5eUfHSQwM8wgI\nzX1JOrkZDVM7iqpvVa6f9iZhfU3/0Llc2mcKqVz0hs9pNu5s8LpbppfwzYrZvk1X\n0MYRZ5Upd11hrHPBDYx/QnZlab0KgCD6E0Z07cUynIzz1PHtCYTnVhhufbWRdMJ1\nkYNdNXWiaI4/bwklb1WQWR/OaARUM91gcuCRmeyBaTVHTAvz4WJ6VHNjDXQsFS/E\nwjREZogHAgMBAAECggEAH4uK8f/8ZYDFpJok94Z2MwnY2xdHG1myu984PXbh8fe5\ngYuvh07GWrxkMs9aJzfiyHM1wyGeNsmNmR10HxfYQpW08nECWb/1XdjWQtC4pyCc\nd2Ebz3j7xZrtSZp6jYapKNmI/GtQdF8Y0Y2QX+SsVdrz+7d1Oha/+Ct0O9DwX80V\nB+RqL1o4TSJytxGjC5Uj0cFgi20yaLU8u5YWUX0vdvomntACHe5UXwh0gqTdOg25\n03yH6yu5BtpctzEkAJ+3j94Emksh6sl1ib9yFv/SJxAb7IeUqfnhIE5gTH+78Fp2\nk48TPLLl91bhXqW0gHjUak1EyNsvrxCerVvlLMErWQKBgQD/dVt1CyTD3/FRh/59\nVTxXb8FWrGv2SW3GEI4VOznARZJmlg8IJVSwyWqnMCVmkoh5q/45qCOEeoNw4obQ\nMqso56u2xBJvpCbjK5tz2/fIWGDJ//sLC9A1Br4JXKY/J88irlGQibHzI5pnefSE\nbDJZhbUz+yBBqIJS+oeWgqXbvwKBgQDNqeiJBaUcOp8GhrPOq9Iik+92o8044BH5\nrjBIBJVdv7p7vtquQYgvK7oC5WI6HAyL1zPt8XUtU7F8Sxk3bJX78oMebVhZAGsG\nj00xot1oZZwXVTTpfQ/4zJuRXwoMBfIeEtlVuqwFJvHRaPu1KurFh+zRvqmfYLY0\nwiINssAFuQKBgBGkWzKUGG/mkVXeHHcvYcFwGFwSAEq7+3bIQee5dV2P8HJhPpyD\nZ3vmDRWKv6p7yC0O8bmtoPZPN7CeFE1gkm16wmMW22cWYREjO9Meh9gwMk8A/Kdg\no3pmAs3Gtjx6VVXB0CQ5Pi7acJlg1MAocLm6AC+c0jd2mbl9T8vXLfklAoGBAMf/\n1zaI2svc5hD+pZTx2mPt4Q1KtaP9ov1fu2wNqQOGE9+K9jZHXBwjNbzjPOatqDXF\njaZzDTSLEyqADYGsgx6D86Z/R08l7O5wJO2EKDQBvA2kutPk3sdgkliIR8jxb0Z3\npgqMggRwnvC6Wy0PE0gMquw9sc5fylD8CQmxLrNhAoGAXHPVy5yt60Hbny8UI0Me\nq9Si0poBYhV82SRd7g7Iz4HWCXpp+0GGFloBBa2RltvvH7zPgrTS36ep2T1Eq1wv\nNk64I4lPu4jTgLgtx2PePp0x3eLZCfhuiYoAXatWYsdMxYjYd+h6wluH8juLgFeD\nt0cntl4hjTUk/D6COrY1e2Y=\n-----END PRIVATE KEY-----",
				)
		: z.string().min(1, "JWT_PRIVATE_KEY is required"),
	JWT_PUBLIC_KEY: isTest
		? z
				.string()
				.default(
					"-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzTqGwTCC3XR8NDF+deCb\nkSYUOjMcakxrb6bacaaoVVRFAPU2xyvKhKaH9z8WXYwKH3yefEfAEhaaJer2wDMD\nZ1ELJcAOGSQ6wBqIvVp4YOhENXVmsmVAoMggVs47cQ5c+XlHx0kMDPMICM19STq5\nGQ1TO4qqb1Wun/YmYX1N/9C5XNpnCqlc9IbPaTbubPC6W6aX8M2K2b5NV9DGEWeV\nKXddYaxzwQ2Mf0J2ZWm9CoAg+hNGdO3FMpyM89Tx7QmE51YYbn21kXTCdZGDXTV1\nomiOP28JJW9VkFkfzmgEVDPdYHLgkZnsgWk1R0wL8+FielRzYw10LBUvxMI0RGaI\nBwIDAQAB\n-----END PUBLIC KEY-----",
				)
		: z.string().min(1, "JWT_PUBLIC_KEY is required"),
	JWT_KEY_ID: z.string().default("spotq-main-key"),
	JWT_ALGORITHM: z
		.enum([
			"RS256",
			"RS384",
			"RS512",
			"PS256",
			"PS384",
			"PS512",
			"ES256",
			"ES384",
			"ES512",
			"HS256",
			"HS384",
			"HS512",
		])
		.default("RS256"),

	JWT_ACCESS_SECRET: isTest
		? z.string().default("test_jwt_access_secret_min_16_chars")
		: z.string().optional(),
	JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

	JWT_REFRESH_SECRET: isTest
		? z.string().default("test_jwt_refresh_secret_min_16_chars")
		: z.string().default("spotq_refresh_secret_default_min_16_chars"),
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
