import crypto from "node:crypto";
import { generateToken, type TokenIssuerConfig } from "@spotq-org/s2s-core";
import request from "supertest";
import app from "../../src/app.ts";
import { config } from "../../src/config/env.ts";
import { prisma } from "../../src/infrastructure/database/prisma/prisma.ts";
import { S2S_CALLER_SERVICES } from "../../src/shared/constants/auth.constants.ts";

describe("Internal User Analytics Summary API (SCRUM-1274)", () => {
	let rsaPrivateKey: string;
	let rsaPublicKey: string;
	const ENDPOINT = "/api/internal/v1/analytics/users/summary";

	beforeAll(() => {
		const keyPair = crypto.generateKeyPairSync("rsa", {
			modulusLength: 2048,
			publicKeyEncoding: { type: "spki", format: "pem" },
			privateKeyEncoding: { type: "pkcs8", format: "pem" },
		});
		rsaPrivateKey = keyPair.privateKey;
		rsaPublicKey = keyPair.publicKey;

		(
			config.s2s as {
				audience: string;
				restaurantPublicKey: string;
				orderPublicKey?: string;
			}
		).audience = "user-service";
		(
			config.s2s as {
				audience: string;
				restaurantPublicKey: string;
				orderPublicKey?: string;
			}
		).restaurantPublicKey = rsaPublicKey;
		(
			config.s2s as {
				audience: string;
				restaurantPublicKey: string;
				orderPublicKey?: string;
			}
		).orderPublicKey = rsaPublicKey;
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return 401 Unauthorized when no Authorization header is provided", async () => {
		const res = await request(app)
			.get(ENDPOINT)
			.set("x-caller-service", S2S_CALLER_SERVICES.RESTAURANT_SERVICE);

		expect(res.status).toBe(401);
		expect(res.body.success).toBe(false);
		expect(res.body.code).toBe("UNAUTHORIZED");
	});

	it("should return 401 Unauthorized when X-Caller-Service header is missing", async () => {
		const tokenConfig: TokenIssuerConfig = {
			serviceName: S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
			privateKey: rsaPrivateKey,
		};
		const token = generateToken("user-service", tokenConfig);

		const res = await request(app)
			.get(ENDPOINT)
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(401);
		expect(res.body.success).toBe(false);
		expect(res.body.code).toBe("UNAUTHORIZED");
	});

	it("should return 401 when token has invalid cryptographic signature", async () => {
		const otherKeyPair = crypto.generateKeyPairSync("rsa", {
			modulusLength: 2048,
			publicKeyEncoding: { type: "spki", format: "pem" },
			privateKeyEncoding: { type: "pkcs8", format: "pem" },
		});
		const tokenConfig: TokenIssuerConfig = {
			serviceName: S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
			privateKey: otherKeyPair.privateKey,
		};
		const token = generateToken("user-service", tokenConfig);

		const res = await request(app)
			.get(ENDPOINT)
			.set("Authorization", `Bearer ${token}`)
			.set("x-caller-service", S2S_CALLER_SERVICES.RESTAURANT_SERVICE);

		expect(res.status).toBe(401);
		expect(res.body.success).toBe(false);
		expect(res.body.code).toBe("INVALID_TOKEN");
	});

	it("should return 401 when caller service is unknown / unconfigured", async () => {
		const tokenConfig: TokenIssuerConfig = {
			serviceName: "unknown-service",
			privateKey: rsaPrivateKey,
		};
		const token = generateToken("user-service", tokenConfig);

		const res = await request(app)
			.get(ENDPOINT)
			.set("Authorization", `Bearer ${token}`)
			.set("x-caller-service", "unknown-service");

		expect(res.status).toBe(401);
		expect(res.body.success).toBe(false);
	});

	it("should return 403 Forbidden when caller is authenticated but not authorized", async () => {
		const tokenConfig: TokenIssuerConfig = {
			serviceName: S2S_CALLER_SERVICES.ORDER_SERVICE,
			privateKey: rsaPrivateKey,
		};
		const token = generateToken("user-service", tokenConfig);

		const res = await request(app)
			.get(ENDPOINT)
			.set("Authorization", `Bearer ${token}`)
			.set("x-caller-service", S2S_CALLER_SERVICES.ORDER_SERVICE);

		expect(res.status).toBe(403);
		expect(res.body.success).toBe(false);
		expect(res.body.code).toBe("FORBIDDEN");
	});

	it("should return 500 Internal Server Error when database count query fails", async () => {
		jest
			.spyOn(prisma.user, "count")
			.mockRejectedValue(new Error("Database connection lost"));

		const tokenConfig: TokenIssuerConfig = {
			serviceName: S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
			privateKey: rsaPrivateKey,
		};
		const token = generateToken("user-service", tokenConfig);

		const res = await request(app)
			.get(ENDPOINT)
			.set("Authorization", `Bearer ${token}`)
			.set("x-caller-service", S2S_CALLER_SERVICES.RESTAURANT_SERVICE);

		expect(res.status).toBe(500);
		expect(res.body.success).toBe(false);
		expect(res.body.message).toBe("An unexpected error occurred");
	});

	it("should return 200 OK with totalRegisteredCustomers on valid S2S call", async () => {
		jest.spyOn(prisma.user, "count").mockResolvedValue(12500);

		const tokenConfig: TokenIssuerConfig = {
			serviceName: S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
			privateKey: rsaPrivateKey,
		};
		const token = generateToken("user-service", tokenConfig);

		const res = await request(app)
			.get(ENDPOINT)
			.set("Authorization", `Bearer ${token}`)
			.set("x-caller-service", S2S_CALLER_SERVICES.RESTAURANT_SERVICE);

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			success: true,
			statusCode: 200,
			message: "User analytics summary fetched successfully",
			data: {
				totalRegisteredCustomers: 12500,
			},
		});
		expect(prisma.user.count).toHaveBeenCalledWith({ where: {} });
	});
});
