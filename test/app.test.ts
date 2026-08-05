import request from "supertest";
import app from "../src/app.js";
import { PrismaService } from "../src/infrastructure/database/prisma/database.service.js";
import { prisma } from "../src/infrastructure/database/prisma/prisma.js";
import { BullMQService } from "../src/infrastructure/queue/bullmq.service.js";
import { redisClient } from "../src/infrastructure/redis/redis.client.js";
import { RedisService } from "../src/infrastructure/redis/redis.service.js";

describe("User Service Integration & Unit Tests", () => {
	let dbSpy: jest.SpyInstance;
	let redisSpy: jest.SpyInstance;
	let bullmqSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		// Spy on the Prisma $queryRaw and Redis ping methods
		dbSpy = jest.spyOn(prisma, "$queryRaw");
		redisSpy = jest.spyOn(redisClient, "ping");
		bullmqSpy = jest.spyOn(BullMQService, "isHealthy");
	});

	afterEach(() => {
		dbSpy.mockRestore();
		redisSpy.mockRestore();
		bullmqSpy.mockRestore();
	});

	describe("GET /health", () => {
		it("should return 200 and status UP when both DB and Redis are healthy", async () => {
			dbSpy.mockResolvedValue([{ 1: 1 }]);
			redisSpy.mockResolvedValue("PONG");
			bullmqSpy.mockResolvedValue(true);

			const res = await request(app).get("/health");

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					status: "UP",
					checks: expect.objectContaining({
						application: "UP",
						database: "UP",
						redis: "UP",
						bullmq: "UP",
					}),
				}),
			);
			expect(dbSpy).toHaveBeenCalled();
			expect(redisSpy).toHaveBeenCalled();
			expect(bullmqSpy).toHaveBeenCalled();
		});

		it("should return 503 and status DOWN when database is unhealthy", async () => {
			dbSpy.mockRejectedValue(new Error("Database connection failed"));
			redisSpy.mockResolvedValue("PONG");
			bullmqSpy.mockResolvedValue(true);

			const res = await request(app).get("/health");

			expect(res.status).toBe(503);
			expect(res.body).toEqual(
				expect.objectContaining({
					status: "DOWN",
					checks: expect.objectContaining({
						application: "UP",
						database: "DOWN",
						redis: "UP",
						bullmq: "UP",
					}),
				}),
			);
		});

		it("should return 503 and status DOWN when Redis is unhealthy", async () => {
			dbSpy.mockResolvedValue([{ 1: 1 }]);
			redisSpy.mockRejectedValue(new Error("Redis connection failed"));
			bullmqSpy.mockResolvedValue(true);

			const res = await request(app).get("/health");

			expect(res.status).toBe(503);
			expect(res.body).toEqual(
				expect.objectContaining({
					status: "DOWN",
					checks: expect.objectContaining({
						application: "UP",
						database: "UP",
						redis: "DOWN",
						bullmq: "UP",
					}),
				}),
			);
		});
	});

	describe("Routing", () => {
		it("should return 404 not found for invalid routes", async () => {
			const res = await request(app).get("/invalid-route-xyz");

			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({
					error: "Not Found",
					message: "Cannot GET /invalid-route-xyz",
				}),
			);
		});
	});

	describe("PrismaService & RedisService Health Checks", () => {
		it("PrismaService.isHealthy should return true when healthy", async () => {
			dbSpy.mockResolvedValue([{ 1: 1 }]);
			const healthy = await PrismaService.isHealthy();
			expect(healthy).toBe(true);
		});

		it("PrismaService.isHealthy should return false when unhealthy", async () => {
			dbSpy.mockRejectedValue(new Error("DB Fail"));
			const healthy = await PrismaService.isHealthy();
			expect(healthy).toBe(false);
		});

		it("RedisService.health should return true when healthy", async () => {
			redisSpy.mockResolvedValue("PONG");
			const healthy = await RedisService.health();
			expect(healthy).toBe(true);
		});

		it("RedisService.health should return false when unhealthy", async () => {
			redisSpy.mockRejectedValue(new Error("Redis Fail"));
			const healthy = await RedisService.health();
			expect(healthy).toBe(false);
		});
	});
});
