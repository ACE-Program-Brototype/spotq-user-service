import type { ITokenService } from "@application/ports/services/token-service.interface.ts";
import { container } from "@config/di/container.ts";
import {
	type AuthenticatedRequest,
	authMiddleware,
} from "@presentation/http/middlewares/auth.middleware.ts";
import type { NextFunction, Response } from "express";

describe("authMiddleware", () => {
	let mockReq: Partial<AuthenticatedRequest>;
	let mockRes: Partial<Response>;
	let mockNext: jest.MockedFunction<NextFunction>;

	beforeEach(() => {
		mockReq = {
			headers: {},
		};
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		mockNext = jest.fn();
	});

	it("should authenticate and populate req.user when X-User-Id is forwarded by API Gateway", () => {
		mockReq.headers = {
			"x-user-id": "gw-user-456",
			"x-user-role": "customer",
			"x-user-email": "customer@example.com",
		};

		authMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "gw-user-456",
			email: "customer@example.com",
			role: "customer",
		});
		expect(mockNext).toHaveBeenCalled();
		expect(mockRes.status).not.toHaveBeenCalled();
	});

	it("should set req.user and call next when fallback Bearer token is valid", () => {
		mockReq.headers = { authorization: "Bearer valid_token" };

		const mockTokenService: Partial<ITokenService> = {
			verifyAccessToken: jest.fn().mockReturnValue({
				sub: "user-123",
				email: "user@example.com",
				role: "customer",
			}),
		};

		jest
			.spyOn(container, "get")
			.mockReturnValue(mockTokenService as ITokenService);

		authMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "user-123",
			email: "user@example.com",
			role: "customer",
		});
		expect(mockNext).toHaveBeenCalled();
	});

	it("should return 401 when neither Gateway headers nor Bearer token are provided", () => {
		mockReq.headers = {};

		authMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 401 when invalid Bearer token is provided", () => {
		mockReq.headers = { authorization: "Bearer invalid_token" };

		const mockTokenService: Partial<ITokenService> = {
			verifyAccessToken: jest.fn().mockImplementation(() => {
				throw new Error("Invalid token");
			}),
		};

		jest
			.spyOn(container, "get")
			.mockReturnValue(mockTokenService as ITokenService);

		authMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockNext).not.toHaveBeenCalled();
	});
});
