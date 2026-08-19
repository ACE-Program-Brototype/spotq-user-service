import "dotenv/config";

import { validateEnv } from "./validate-env.ts";

const env = validateEnv();

export const config = {
	server: {
		port: env.PORT,
		nodeEnv: env.NODE_ENV,
	},

	service: {
		name: env.SERVICE_NAME,
		logLevel: env.LOG_LEVEL,
	},

	database: {
		url: env.DATABASE_URL,
		sslEnabled: env.DATABASE_SSL_ENABLED,
		caCert: env.DATABASE_CA_CERT,
	},

	redis: {
		url: env.REDIS_URL,
	},

	auth: {
		bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
	},

	jwt: {
		accessSecret: env.JWT_ACCESS_SECRET,
		refreshSecret: env.JWT_REFRESH_SECRET,
		accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
		refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
	},

	brevo: {
		apiKey: env.BREVO_API_KEY,
		senderEmail: env.BREVO_SENDER_EMAIL,
		senderName: env.BREVO_SENDER_NAME,
	},
	google: {
		clientId: env.GOOGLE_CLIENT_ID,
	},

	otp: {
		ttlSeconds: env.OTP_TTL_SECONDS,
		maxAttempts: env.OTP_MAX_ATTEMPTS,
	},
} as const;
