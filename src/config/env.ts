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

	admin: {
		name: env.ADMIN_NAME,
		email: env.ADMIN_EMAIL,
		password: env.ADMIN_PASSWORD,
	},

	jwt: {
		access: {
			privateKey: env.JWT_PRIVATE_KEY.replace(/\\n/g, "\n"),
			publicKey: env.JWT_PUBLIC_KEY.replace(/\\n/g, "\n"),
			keyId: env.JWT_KEY_ID,
			secret: env.JWT_ACCESS_SECRET,
			expiresIn: env.JWT_ACCESS_EXPIRES_IN,
		},
		refresh: {
			secret: env.JWT_REFRESH_SECRET,
			expiresIn: env.JWT_REFRESH_EXPIRES_IN,
		},
		temp: {
			secret: env.JWT_TEMP_SECRET,
			expiresIn: env.JWT_TEMP_EXPIRES_IN,
		},
	},

	cookie: {
		httpOnly: env.COOKIE_HTTPONLY,
		secure: env.COOKIE_SECURE,
		sameSite: env.COOKIE_SAME_SITE,
		refreshMaxAge: env.COOKIE_REFRESH_MAX_AGE,
		tempMaxAge: env.COOKIE_TEMP_MAX_AGE,
	},

	auth: {
		bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
	},

	brevo: {
		apiKey: env.BREVO_API_KEY,
		senderName: env.BREVO_SENDER_NAME,
		senderEmail: env.BREVO_SENDER_EMAIL,
	},

	google: {
		clientId: env.GOOGLE_CLIENT_ID,
	},

	otp: {
		ttlSeconds: env.OTP_TTL_SECONDS,
		maxAttempts: env.OTP_MAX_ATTEMPTS,
	},

	rateLimit: {
		forgotPassword: {
			windowMs: env.RATE_LIMIT_FORGOT_PASSWORD_WINDOW_MS,
			max: env.RATE_LIMIT_FORGOT_PASSWORD_MAX,
		},
		forgotPasswordResend: {
			windowMs: env.RATE_LIMIT_FORGOT_PASSWORD_RESEND_WINDOW_MS,
			max: env.RATE_LIMIT_FORGOT_PASSWORD_RESEND_MAX,
		},
		forgotPasswordVerify: {
			windowMs: env.RATE_LIMIT_FORGOT_PASSWORD_VERIFY_WINDOW_MS,
			max: env.RATE_LIMIT_FORGOT_PASSWORD_VERIFY_MAX,
		},
	},
} as const;
