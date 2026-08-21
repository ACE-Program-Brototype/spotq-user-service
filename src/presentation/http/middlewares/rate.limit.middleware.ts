import { redisClient } from "@infrastructure/redis";
import type { Request } from "express";
import { rateLimit } from "express-rate-limit";
import { RedisStore, type SendCommandFn } from "rate-limit-redis";

const redisSendCommand: SendCommandFn = async (...args) => {
	return redisClient.sendCommand(args);
};

const createEmailRateLimiter = ({
	prefix,
	windowMs,
	limit,
	message,
}: {
	prefix: string;
	windowMs: number;
	limit: number;
	message: string;
}) => {
	return rateLimit({
		windowMs,
		limit,

		standardHeaders: "draft-7",
		legacyHeaders: false,

		keyGenerator: (req: Request) => {
			const email = req.body?.email?.toLowerCase()?.trim();

			if (!email) {
				throw new Error("Email is required for rate limiting");
			}

			return `${prefix}:${email}`;
		},

		store: new RedisStore({
			sendCommand: redisSendCommand,
		}),

		message: {
			success: false,
			message,
		},
	});
};

export const forgotPasswordRateLimit = createEmailRateLimiter({
	prefix: "admin:forgot-password",
	windowMs: 24 * 60 * 60 * 1000,
	limit: 3,
	message: "Too many password reset requests. Please try again after 24 hours.",
});

export const forgotPasswordResendRateLimit = createEmailRateLimiter({
	prefix: "admin:forgot-password:resend",
	windowMs: 5 * 60 * 1000,
	limit: 5,
	message: "Too many OTP resend requests. Please try again after 5 minutes.",
});

export const forgotPasswordVerifyRateLimit = createEmailRateLimiter({
	prefix: "admin:forgot-password:verify",
	windowMs: 5 * 60 * 1000,
	limit: 5,
	message:
		"Too many OTP verification attempts. Please try again after 5 minutes.",
});
