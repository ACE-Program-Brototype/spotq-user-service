import { config } from "@config/env.ts";
import { redisClient } from "@infrastructure/redis";
import type { Request, RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import { RedisStore, type SendCommandFn } from "rate-limit-redis";

const redisSendCommand: SendCommandFn = async (...args) => {
	return redisClient.sendCommand(args);
};

const isTestEnvironment =
	process.env.NODE_ENV === "test" || process.env.NODE_ENV === "testing";

const createDeferredRateLimiter = (
	factory: () => RequestHandler,
): RequestHandler => {
	let limiter: RequestHandler | undefined;

	return (req, res, next) => {
		limiter ??= factory();
		return limiter(req, res, next);
	};
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

		...(isTestEnvironment
			? {}
			: {
					store: new RedisStore({ sendCommand: redisSendCommand }),
				}),

		message: {
			success: false,
			message,
		},
	});
};

export const createForgotPasswordRateLimit = () =>
	createEmailRateLimiter({
		prefix: "admin:forgot-password",
		windowMs: config.rateLimit.forgotPassword.windowMs,
		limit: config.rateLimit.forgotPassword.max,
		message:
			"Too many password reset requests. Please try again after 24 hours.",
	});

export const createForgotPasswordResendRateLimit = () =>
	createEmailRateLimiter({
		prefix: "admin:forgot-password:resend",
		windowMs: config.rateLimit.forgotPasswordResend.windowMs,
		limit: config.rateLimit.forgotPasswordResend.max,
		message: "Too many OTP resend requests. Please try again after 5 minutes.",
	});

export const createForgotPasswordVerifyRateLimit = () =>
	createEmailRateLimiter({
		prefix: "admin:forgot-password:verify",
		windowMs: config.rateLimit.forgotPasswordVerify.windowMs,
		limit: config.rateLimit.forgotPasswordVerify.max,
		message:
			"Too many OTP verification attempts. Please try again after 5 minutes.",
	});

export const forgotPasswordRateLimit = createDeferredRateLimiter(
	createForgotPasswordRateLimit,
);

export const forgotPasswordResendRateLimit = createDeferredRateLimiter(
	createForgotPasswordResendRateLimit,
);

export const forgotPasswordVerifyRateLimit = createDeferredRateLimiter(
	createForgotPasswordVerifyRateLimit,
);
