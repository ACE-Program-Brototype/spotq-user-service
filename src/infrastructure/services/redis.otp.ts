import crypto from "node:crypto";
import type { IOtpService } from "@domain/repository/shared/IOtp.service";
import { redisClient } from "@infrastructure/redis/redis.client.ts";
import { injectable } from "inversify";
import { OtpExpiredError } from "@domain/errors/otp.expired.error";
import { InvalidOtpError } from "@domain/errors/invalid.otp.error";

@injectable()
export class RedisOtpService implements IOtpService {
	private static readonly OTP_TTL_SECONDS = 300; // 5 minutes

	private getKey(email: string): string {
		return `otp:email:${email.trim().toLowerCase()}`;
	}

	private hashOtp(otp: string): string {
		return crypto.createHash("sha256").update(otp.trim()).digest("hex");
	}

	public async generateAndStoreOtp(email: string): Promise<string> {
		const key = this.getKey(email);

		// Generate cryptographically secure 6-digit numeric OTP (100000 - 999999)
		const otp = crypto.randomInt(100000, 1000000).toString();
		const hashedOtp = this.hashOtp(otp);

		// Store hash and reset attempts
		await redisClient.hSet(key, {
			hash: hashedOtp,
		});
		await redisClient.expire(key, RedisOtpService.OTP_TTL_SECONDS);

		return otp;
	}

	public async verifyOtp(email: string, otp: string): Promise<boolean> {
		const key = this.getKey(email);
		const data = await redisClient.hGetAll(key);

		if (!data?.hash) {
			throw new OtpExpiredError()
		}

		const inputHash = this.hashOtp(otp);

		// Use constant-time comparison to prevent timing attacks
		const isMatch = crypto.timingSafeEqual(
			Buffer.from(inputHash, "hex"),
			Buffer.from(data.hash, "hex"),
		);

		if (!isMatch) {
			throw new InvalidOtpError()
		}

		// Invalidate OTP immediately upon successful verification (single-use)
		await redisClient.del(key);
		return true;
	}

	public async invalidateOtp(email: string): Promise<void> {
		const key = this.getKey(email);
		await redisClient.del(key);
	}
}
