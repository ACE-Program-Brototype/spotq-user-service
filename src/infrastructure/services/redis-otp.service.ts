import crypto from "node:crypto";
import type { IOtpService } from "@application/ports/services/otp-service.interface.ts";
import {
	InvalidOtpError,
	OtpExpiredError,
	OtpMaxAttemptsExceededError,
} from "@domain/errors/domain.error.ts";
import { redisClient } from "@infrastructure/redis/redis.client.ts";
import { OTP_CONSTANTS } from "@shared/constants/index.ts";
import { injectable } from "inversify";

@injectable()
export class RedisOtpService implements IOtpService {
	private async ensureConnected(): Promise<void> {
		if (!redisClient.isOpen) {
			await redisClient.connect();
		}
	}

	private getKey(email: string): string {
		return `otp:email:${email.trim().toLowerCase()}`;
	}

	private hashOtp(otp: string): string {
		return crypto.createHash("sha256").update(otp.trim()).digest("hex");
	}

	public async generateAndStoreOtp(email: string): Promise<string> {
		await this.ensureConnected();
		const key = this.getKey(email);

		// Generate cryptographically secure 6-digit numeric OTP (100000 - 999999)
		const otp = crypto.randomInt(100000, 1000000).toString();
		const hashedOtp = this.hashOtp(otp);

		// Store hash and reset attempts
		await redisClient.hSet(key, {
			hash: hashedOtp,
			attempts: "0",
		});
		await redisClient.expire(key, OTP_CONSTANTS.TTL_SECONDS);

		return otp;
	}

	public async verifyOtp(email: string, otp: string): Promise<boolean> {
		await this.ensureConnected();
		const key = this.getKey(email);
		const data = await redisClient.hGetAll(key);

		if (!data?.hash) {
			throw new OtpExpiredError("OTP is invalid or has expired.");
		}

		const attempts = Number.parseInt(data.attempts || "0", 10) + 1;
		await redisClient.hSet(key, "attempts", attempts.toString());

		if (attempts > OTP_CONSTANTS.MAX_ATTEMPTS) {
			// Invalidate OTP as max attempts exceeded
			await redisClient.del(key);
			throw new OtpMaxAttemptsExceededError(
				"Maximum OTP verification attempts exceeded. Please request a new OTP.",
			);
		}

		const inputHash = this.hashOtp(otp);

		// Use constant-time comparison to prevent timing attacks
		const isMatch = crypto.timingSafeEqual(
			Buffer.from(inputHash, "hex"),
			Buffer.from(data.hash, "hex"),
		);

		if (!isMatch) {
			if (attempts === OTP_CONSTANTS.MAX_ATTEMPTS) {
				await redisClient.del(key);
				throw new OtpMaxAttemptsExceededError(
					"Maximum OTP verification attempts exceeded. Please request a new OTP.",
				);
			}
			throw new InvalidOtpError("Invalid OTP provided.");
		}

		// Invalidate OTP immediately upon successful verification (single-use)
		await redisClient.del(key);
		return true;
	}

	public async invalidateOtp(email: string): Promise<void> {
		await this.ensureConnected();
		const key = this.getKey(email);
		await redisClient.del(key);
	}
}
