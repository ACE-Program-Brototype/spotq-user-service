import {
	InvalidOtpError,
	OtpExpiredError,
	OtpMaxAttemptsExceededError,
} from "@domain/errors/domain.error.ts";
import { redisClient } from "@infrastructure/redis/redis.client.ts";
import { RedisOtpService } from "@infrastructure/services/redis-otp.service.ts";

jest.mock("@infrastructure/redis/redis.client.ts", () => ({
	redisClient: {
		isOpen: true,
		connect: jest.fn().mockResolvedValue(undefined),
		hSet: jest.fn().mockResolvedValue(1),
		hGetAll: jest.fn(),
		expire: jest.fn().mockResolvedValue(true),
		del: jest.fn().mockResolvedValue(1),
	},
}));

describe("RedisOtpService", () => {
	let otpService: RedisOtpService;

	beforeEach(() => {
		jest.clearAllMocks();
		otpService = new RedisOtpService();
	});

	it("should generate a 6-digit numeric OTP and store its hash in Redis", async () => {
		const otp = await otpService.generateAndStoreOtp("test@example.com");

		expect(otp).toHaveLength(6);
		expect(/^\d{6}$/.test(otp)).toBe(true);
		expect(redisClient.hSet).toHaveBeenCalledWith(
			"otp:email:test@example.com",
			expect.objectContaining({
				hash: expect.any(String),
				attempts: "0",
			}),
		);
		expect(redisClient.expire).toHaveBeenCalledWith(
			"otp:email:test@example.com",
			300,
		);
	});

	it("should throw OtpExpiredError when verifying non-existent or expired OTP", async () => {
		(redisClient.hGetAll as jest.Mock).mockResolvedValue({});

		await expect(
			otpService.verifyOtp("test@example.com", "123456"),
		).rejects.toThrow(OtpExpiredError);
	});

	it("should successfully verify matching OTP and delete key (single-use)", async () => {
		const crypto = await import("node:crypto");
		const rawOtp = "123456";
		const expectedHash = crypto
			.createHash("sha256")
			.update(rawOtp)
			.digest("hex");

		(redisClient.hGetAll as jest.Mock).mockResolvedValue({
			hash: expectedHash,
			attempts: "0",
		});

		const result = await otpService.verifyOtp("test@example.com", rawOtp);

		expect(result).toBe(true);
		expect(redisClient.del).toHaveBeenCalledWith("otp:email:test@example.com");
	});

	it("should throw InvalidOtpError and increment attempts on wrong OTP", async () => {
		const crypto = await import("node:crypto");
		const correctHash = crypto
			.createHash("sha256")
			.update("654321")
			.digest("hex");

		(redisClient.hGetAll as jest.Mock).mockResolvedValue({
			hash: correctHash,
			attempts: "1",
		});

		await expect(
			otpService.verifyOtp("test@example.com", "000000"),
		).rejects.toThrow(InvalidOtpError);

		expect(redisClient.hSet).toHaveBeenCalledWith(
			"otp:email:test@example.com",
			"attempts",
			"2",
		);
	});

	it("should throw OtpMaxAttemptsExceededError and delete OTP when attempts exceed limit", async () => {
		const crypto = await import("node:crypto");
		const correctHash = crypto
			.createHash("sha256")
			.update("654321")
			.digest("hex");

		(redisClient.hGetAll as jest.Mock).mockResolvedValue({
			hash: correctHash,
			attempts: "5",
		});

		await expect(
			otpService.verifyOtp("test@example.com", "000000"),
		).rejects.toThrow(OtpMaxAttemptsExceededError);

		expect(redisClient.del).toHaveBeenCalledWith("otp:email:test@example.com");
	});

	it("should invalidate OTP when calling invalidateOtp", async () => {
		await otpService.invalidateOtp("test@example.com");
		expect(redisClient.del).toHaveBeenCalledWith("otp:email:test@example.com");
	});
});
