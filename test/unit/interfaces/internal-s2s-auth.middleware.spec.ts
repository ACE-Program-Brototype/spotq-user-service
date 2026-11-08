import crypto from "node:crypto";
import { config } from "@config/env.ts";
import {
	internalS2SAuthMiddleware,
	requireCallerService,
} from "@interfaces/http/middlewares/internal-s2s-auth.middleware.ts";
import { S2S_CALLER_SERVICES } from "@shared/constants/auth.constants.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { generateToken, type TokenIssuerConfig } from "@spotq-org/s2s-core";
import type { NextFunction, Request, Response } from "express";

interface MockResponse {
	statusCode: number;
	body: unknown;
	status: jest.Mock;
	json: jest.Mock;
}

function createMockResponse(): MockResponse {
	const res: Partial<MockResponse> = {};
	res.status = jest.fn().mockImplementation((code: number) => {
		res.statusCode = code;
		return res;
	});
	res.json = jest.fn().mockImplementation((data: unknown) => {
		res.body = data;
		return res;
	});
	return res as MockResponse;
}

describe("Internal S2S Auth Middleware & Caller Authorization", () => {
	let rsaPrivateKey: string;
	let rsaPublicKey: string;
	let nextFn: jest.MockedFunction<NextFunction>;

	beforeAll(() => {
		const keyPair = crypto.generateKeyPairSync("rsa", {
			modulusLength: 2048,
			publicKeyEncoding: { type: "spki", format: "pem" },
			privateKeyEncoding: { type: "pkcs8", format: "pem" },
		});
		rsaPrivateKey = keyPair.privateKey;
		rsaPublicKey = keyPair.publicKey;

		// Inject test public key into config
		(config.s2s as { audience: string; restaurantPublicKey: string }).audience =
			"user-service";
		(
			config.s2s as { audience: string; restaurantPublicKey: string }
		).restaurantPublicKey = rsaPublicKey;
	});

	beforeEach(() => {
		nextFn = jest.fn();
	});

	describe("internalS2SAuthMiddleware", () => {
		it("should reject with 401 UNAUTHORIZED when Authorization header is missing", () => {
			const req = {
				headers: {
					"x-caller-service": S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
				},
			} as unknown as Request;
			const res = createMockResponse();

			const middleware = internalS2SAuthMiddleware();
			middleware(req, res as unknown as Response, nextFn);

			expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
			expect(res.body).toEqual(
				expect.objectContaining({
					success: false,
					statusCode: 401,
					code: "UNAUTHORIZED",
				}),
			);
			expect(nextFn).not.toHaveBeenCalled();
		});

		it("should reject with 401 UNAUTHORIZED when X-Caller-Service header is missing", () => {
			const tokenConfig: TokenIssuerConfig = {
				serviceName: S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
				privateKey: rsaPrivateKey,
			};
			const token = generateToken("user-service", tokenConfig);

			const req = {
				headers: {
					authorization: `Bearer ${token}`,
				},
			} as unknown as Request;
			const res = createMockResponse();

			const middleware = internalS2SAuthMiddleware();
			middleware(req, res as unknown as Response, nextFn);

			expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
			expect(res.body).toEqual(
				expect.objectContaining({
					success: false,
					statusCode: 401,
					code: "UNAUTHORIZED",
				}),
			);
			expect(nextFn).not.toHaveBeenCalled();
		});

		it("should reject with 401 INVALID_TOKEN when signature is invalid", () => {
			const otherKeyPair = crypto.generateKeyPairSync("rsa", {
				modulusLength: 2048,
				publicKeyEncoding: { type: "spki", format: "pem" },
				privateKeyEncoding: { type: "pkcs8", format: "pem" },
			});
			const tokenConfig: TokenIssuerConfig = {
				serviceName: S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
				privateKey: otherKeyPair.privateKey,
			};
			const invalidToken = generateToken("user-service", tokenConfig);

			const req = {
				headers: {
					authorization: `Bearer ${invalidToken}`,
					"x-caller-service": S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
				},
			} as unknown as Request;
			const res = createMockResponse();

			const middleware = internalS2SAuthMiddleware();
			middleware(req, res as unknown as Response, nextFn);

			expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
			expect(res.body).toEqual(
				expect.objectContaining({
					success: false,
					statusCode: 401,
					code: "INVALID_TOKEN",
				}),
			);
			expect(nextFn).not.toHaveBeenCalled();
		});

		it("should reject with 401 INVALID_TOKEN when audience is mismatched", () => {
			const tokenConfig: TokenIssuerConfig = {
				serviceName: S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
				privateKey: rsaPrivateKey,
			};
			const wrongAudienceToken = generateToken("wrong-service", tokenConfig);

			const req = {
				headers: {
					authorization: `Bearer ${wrongAudienceToken}`,
					"x-caller-service": S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
				},
			} as unknown as Request;
			const res = createMockResponse();

			const middleware = internalS2SAuthMiddleware();
			middleware(req, res as unknown as Response, nextFn);

			expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
			expect(res.body).toEqual(
				expect.objectContaining({
					success: false,
					statusCode: 401,
					code: "INVALID_TOKEN",
				}),
			);
			expect(nextFn).not.toHaveBeenCalled();
		});

		it("should call next() and populate req.callerService when valid token and header are provided", () => {
			const tokenConfig: TokenIssuerConfig = {
				serviceName: S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
				privateKey: rsaPrivateKey,
			};
			const validToken = generateToken("user-service", tokenConfig);

			const req = {
				headers: {
					authorization: `Bearer ${validToken}`,
					"x-caller-service": S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
				},
			} as unknown as Request;
			const res = createMockResponse();

			const middleware = internalS2SAuthMiddleware();
			middleware(req, res as unknown as Response, nextFn);

			expect(nextFn).toHaveBeenCalledTimes(1);
			expect(req.callerService).toBe(S2S_CALLER_SERVICES.RESTAURANT_SERVICE);
		});
	});

	describe("requireCallerService", () => {
		it("should reject with 403 FORBIDDEN when callerService does not match allowed service", () => {
			const req = {
				callerService: "order-service",
			} as unknown as Request;
			const res = createMockResponse();

			const guard = requireCallerService(
				S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
			);
			guard(req, res as unknown as Response, nextFn);

			expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
			expect(res.body).toEqual(
				expect.objectContaining({
					success: false,
					statusCode: 403,
					code: "FORBIDDEN",
				}),
			);
			expect(nextFn).not.toHaveBeenCalled();
		});

		it("should call next() when callerService matches allowed service", () => {
			const req = {
				callerService: S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
			} as unknown as Request;
			const res = createMockResponse();

			const guard = requireCallerService(
				S2S_CALLER_SERVICES.RESTAURANT_SERVICE,
			);
			guard(req, res as unknown as Response, nextFn);

			expect(nextFn).toHaveBeenCalledTimes(1);
		});
	});
});
