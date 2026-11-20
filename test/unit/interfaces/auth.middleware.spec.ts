import {
	type AuthenticatedRequest,
	authMiddleware,
} from "@interfaces/http/middlewares/auth.middleware.ts";
import { authConstants } from "@shared/constants/auth.constants.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ApiResponse } from "@shared/response/api-response.model.ts";
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

	it("should reject request when x-user-id header is missing", () => {
		mockReq.headers = {};

		authMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
		expect(mockRes.json).toHaveBeenCalledWith(
			ApiResponse.fail(
				authConstants.GATEWAY_UNAUTHORIZED,
				HttpStatus.UNAUTHORIZED,
				"UNAUTHORIZED",
			),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should reject request when x-user-id header is empty string", () => {
		mockReq.headers = {
			"x-user-id": "   ",
		};

		authMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
		expect(mockRes.json).toHaveBeenCalledWith(
			ApiResponse.fail(
				authConstants.GATEWAY_UNAUTHORIZED,
				HttpStatus.UNAUTHORIZED,
				"UNAUTHORIZED",
			),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should attach user context to request and call next when headers are present", () => {
		mockReq.headers = {
			"x-user-id": "user-123",
			"x-user-email": "user@example.com",
			"x-user-role": "customer",
		};

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
		expect(mockReq.userId).toBe("user-123");
		expect(mockNext).toHaveBeenCalledTimes(1);
	});

	it("should handle missing optional email and role headers", () => {
		mockReq.headers = {
			"x-user-id": "user-123",
		};

		authMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "user-123",
			email: "",
			role: undefined,
		});
		expect(mockReq.userId).toBe("user-123");
		expect(mockNext).toHaveBeenCalledTimes(1);
	});

	it("should handle array header values correctly", () => {
		mockReq.headers = {
			"x-user-id": ["user-456"],
			"x-user-email": ["user456@example.com"],
			"x-user-role": ["customer"],
		};

		authMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "user-456",
			email: "user456@example.com",
			role: "customer",
		});
		expect(mockReq.userId).toBe("user-456");
		expect(mockNext).toHaveBeenCalledTimes(1);
	});

	it("should trim x-user-id header correctly", () => {
		mockReq.headers = {
			"x-user-id": "  user-789  ",
		};

		authMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.userId).toBe("user-789");
		expect(mockReq.user?.userId).toBe("user-789");
		expect(mockNext).toHaveBeenCalledTimes(1);
	});
});
