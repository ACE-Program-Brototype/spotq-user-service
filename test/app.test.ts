import { HealthStatus } from "@shared/constants/health-status.constants.js";
import request from "supertest";
import app from "../src/app.js";
import { validateEnv } from "../src/config/validate-env.ts";
import { PrismaService } from "../src/infrastructure/database/prisma/database.service.js";
import { prisma } from "../src/infrastructure/database/prisma/prisma.js";
import { BullMQService } from "../src/infrastructure/queue/bullmq.service.js";
import { redisClient } from "../src/infrastructure/redis/redis.client.js";
import { RedisService } from "../src/infrastructure/redis/redis.service.js";

describe("User Service Integration & Unit Tests", () => {
	it("should accept Jest's default NODE_ENV=test when validating env", () => {
		const originalNodeEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "test";

		try {
			const env = validateEnv();
			expect(env.NODE_ENV).toBe("testing");
		} finally {
			if (originalNodeEnv === undefined) {
				delete process.env.NODE_ENV;
			} else {
				process.env.NODE_ENV = originalNodeEnv;
			}
		}
	});

	let dbSpy: jest.SpyInstance;
	let redisSpy: jest.SpyInstance;
	let bullmqSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		// Spy on the Prisma $queryRaw, Redis ping, and BullMQService isHealthy
		dbSpy = jest.spyOn(prisma, "$queryRaw");
		redisSpy = jest.spyOn(redisClient, "ping");
		bullmqSpy = jest.spyOn(BullMQService.prototype, "isHealthy");
	});

	afterEach(() => {
		dbSpy.mockRestore();
		redisSpy.mockRestore();
		bullmqSpy.mockRestore();
	});

	describe("GET /health", () => {
		it("should return 200 and status UP when both DB and Redis are healthy", async () => {
			dbSpy.mockResolvedValue([{ 1: 1 }]);
			redisSpy.mockResolvedValue(HealthStatus.PONG);
			bullmqSpy.mockResolvedValue(true);

			const res = await request(app).get("/health");

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					status: HealthStatus.UP,
					checks: expect.objectContaining({
						application: HealthStatus.UP,
						database: HealthStatus.UP,
						redis: HealthStatus.UP,
						bullmq: HealthStatus.UP,
					}),
				}),
			);
			expect(dbSpy).toHaveBeenCalled();
			expect(redisSpy).toHaveBeenCalled();
			expect(bullmqSpy).toHaveBeenCalled();
		});

		it("should return 503 and status DOWN when database is unhealthy", async () => {
			dbSpy.mockRejectedValue(new Error("Database connection failed"));
			redisSpy.mockResolvedValue(HealthStatus.PONG);
			bullmqSpy.mockResolvedValue(true);

			const res = await request(app).get("/health");

			expect(res.status).toBe(503);
			expect(res.body).toEqual(
				expect.objectContaining({
					status: HealthStatus.DOWN,
					checks: expect.objectContaining({
						application: HealthStatus.UP,
						database: HealthStatus.DOWN,
						redis: HealthStatus.UP,
						bullmq: HealthStatus.UP,
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
					status: HealthStatus.DOWN,
					checks: expect.objectContaining({
						application: HealthStatus.UP,
						database: HealthStatus.UP,
						redis: HealthStatus.DOWN,
						bullmq: HealthStatus.UP,
					}),
				}),
			);
		});
	});

	describe("Routing", () => {
		it("should return JWKS keys with RS256 algorithm on GET /.well-known/jwks.json", async () => {
			const res = await request(app).get("/.well-known/jwks.json");

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("keys");
			expect(Array.isArray(res.body.keys)).toBe(true);
			expect(res.body.keys.length).toBeGreaterThan(0);
			expect(res.body.keys[0]).toEqual(
				expect.objectContaining({
					kty: "RSA",
					use: "sig",
					alg: "RS256",
					kid: "spotq-main-key",
				}),
			);
			expect(res.body.keys[0].n).toBeDefined();
			expect(res.body.keys[0].e).toBe("AQAB");
		});

		it("should return 404 not found for invalid routes", async () => {
			const res = await request(app).get("/invalid-route-xyz");

			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({
					success: false,
					statusCode: 404,
					error: "Requested route not found",
					message: "Cannot GET /invalid-route-xyz",
				}),
			);
		});
	});

	describe("IHealthCheckable Services (PrismaService, RedisService, BullMQService)", () => {
		const prismaService = new PrismaService();
		const redisService = new RedisService();
		const bullmqService = new BullMQService();

		it("PrismaService.isHealthy should return true when healthy", async () => {
			dbSpy.mockResolvedValue([{ 1: 1 }]);
			const healthy = await prismaService.isHealthy();
			expect(healthy).toBe(true);
		});

		it("PrismaService.isHealthy should return false when unhealthy", async () => {
			dbSpy.mockRejectedValue(new Error("DB Fail"));
			const healthy = await prismaService.isHealthy();
			expect(healthy).toBe(false);
		});

		it("RedisService.isHealthy should return true when healthy", async () => {
			redisSpy.mockResolvedValue(HealthStatus.PONG);
			const healthy = await redisService.isHealthy();
			expect(healthy).toBe(true);
		});

		it("RedisService.isHealthy should return false when unhealthy", async () => {
			redisSpy.mockRejectedValue(new Error("Redis Fail"));
			const healthy = await redisService.isHealthy();
			expect(healthy).toBe(false);
		});

		it("BullMQService.isHealthy should return false when client is not connected", async () => {
			bullmqSpy.mockRestore();
			const healthy = await bullmqService.isHealthy();
			expect(healthy).toBe(false);
		});
	});

	describe("HealthService Unit Tests (DI with IHealthCheckable)", () => {
		it("should return UP when all checkables are healthy", async () => {
			const mockDb = { isHealthy: jest.fn().mockResolvedValue(true) };
			const mockRedis = { isHealthy: jest.fn().mockResolvedValue(true) };
			const mockBullmq = { isHealthy: jest.fn().mockResolvedValue(true) };

			const { HealthService } = await import(
				"../src/modules/health/health.service.js"
			);
			const healthService = new HealthService(mockDb, mockRedis, mockBullmq);
			const result = await healthService.check();

			expect(result.status).toBe(HealthStatus.UP);
			expect(result.checks).toEqual({
				application: HealthStatus.UP,
				database: HealthStatus.UP,
				redis: HealthStatus.UP,
				bullmq: HealthStatus.UP,
			});
		});

		it("should return DOWN when any checkable is unhealthy", async () => {
			const mockDb = { isHealthy: jest.fn().mockResolvedValue(false) };
			const mockRedis = { isHealthy: jest.fn().mockResolvedValue(true) };
			const mockBullmq = { isHealthy: jest.fn().mockResolvedValue(true) };

			const { HealthService } = await import(
				"../src/modules/health/health.service.js"
			);
			const healthService = new HealthService(mockDb, mockRedis, mockBullmq);
			const result = await healthService.check();

			expect(result.status).toBe(HealthStatus.DOWN);
			expect(result.checks.database).toBe(HealthStatus.DOWN);
		});
	});

	describe("Inversify DI Container", () => {
		it("should resolve HealthService and HealthController from container", async () => {
			const { container, TYPES } = await import("../src/config/di/index.js");
			const { HealthService } = await import(
				"../src/modules/health/health.service.js"
			);
			const { HealthController } = await import(
				"../src/modules/health/health.controller.js"
			);

			const healthService = container.get(TYPES.HealthService);
			const healthController = container.get(TYPES.HealthController);

			expect(healthService).toBeInstanceOf(HealthService);
			expect(healthController).toBeInstanceOf(HealthController);
		});

		it("should resolve IHealthCheckable implementations for db, redis, and bullmq", async () => {
			const { container, TYPES } = await import("../src/config/di/index.js");
			const { PrismaService } = await import(
				"../src/infrastructure/database/prisma/database.service.js"
			);
			const { RedisService } = await import(
				"../src/infrastructure/redis/redis.service.js"
			);
			const { BullMQService } = await import(
				"../src/infrastructure/queue/bullmq.service.js"
			);

			const dbHealth = container.get(TYPES.DatabaseHealthCheckable);
			const redisHealth = container.get(TYPES.RedisHealthCheckable);
			const bullmqHealth = container.get(TYPES.BullMQHealthCheckable);

			expect(dbHealth).toBeInstanceOf(PrismaService);
			expect(redisHealth).toBeInstanceOf(RedisService);
			expect(bullmqHealth).toBeInstanceOf(BullMQService);
		});
	});

	describe("Infrastructure Lifecycle (initInfrastructure & shutdownInfrastructure)", () => {
		it("should connect all services during initInfrastructure", async () => {
			const { initInfrastructure } = await import(
				"../src/infrastructure/index.js"
			);
			const { container, TYPES } = await import("../src/config/di/index.js");
			const prismaService = container.get<PrismaService>(TYPES.PrismaService);
			const redisService = container.get<RedisService>(TYPES.RedisService);
			const bullmqService = container.get<BullMQService>(TYPES.BullMQService);

			const prismaConnectSpy = jest
				.spyOn(prismaService, "connect")
				.mockResolvedValue(undefined);
			const redisConnectSpy = jest
				.spyOn(redisService, "connect")
				.mockResolvedValue(undefined);
			const bullmqConnectSpy = jest
				.spyOn(bullmqService, "connect")
				.mockResolvedValue(undefined);

			await initInfrastructure();

			expect(prismaConnectSpy).toHaveBeenCalled();
			expect(redisConnectSpy).toHaveBeenCalled();
			expect(bullmqConnectSpy).toHaveBeenCalled();
		});

		it("should disconnect all services during shutdownInfrastructure", async () => {
			const { shutdownInfrastructure } = await import(
				"../src/infrastructure/index.js"
			);
			const { container, TYPES } = await import("../src/config/di/index.js");
			const prismaService = container.get<PrismaService>(TYPES.PrismaService);
			const redisService = container.get<RedisService>(TYPES.RedisService);
			const bullmqService = container.get<BullMQService>(TYPES.BullMQService);

			const prismaDisconnectSpy = jest
				.spyOn(prismaService, "disconnect")
				.mockResolvedValue(undefined);
			const redisDisconnectSpy = jest
				.spyOn(redisService, "disconnect")
				.mockResolvedValue(undefined);
			const bullmqDisconnectSpy = jest
				.spyOn(bullmqService, "disconnect")
				.mockResolvedValue(undefined);

			await shutdownInfrastructure();

			expect(prismaDisconnectSpy).toHaveBeenCalled();
			expect(redisDisconnectSpy).toHaveBeenCalled();
			expect(bullmqDisconnectSpy).toHaveBeenCalled();
		});
	});
});
