import type { ITokenService } from "@application/ports/services/token-service.interface.ts";
import { container } from "@config/di/container.ts";
import {
	type AuthenticatedRequest,
	authMiddleware,
} from "@interfaces/http/middlewares/auth.middleware.ts";
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

	it("should return 401 when authorization header is missing", () => {
		authMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 401 when authorization header does not start with Bearer", () => {
		mockReq.headers = { authorization: "Basic 12345" };

		authMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should set req.user and call next when token is valid", () => {
		mockReq.headers = { authorization: "Bearer valid_token" };

		const mockTokenService: Partial<ITokenService> = {
			verifyAccessToken: jest.fn().mockReturnValue({
				sub: "user-123",
				email: "user@example.com",
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
		});
		expect(mockNext).toHaveBeenCalled();
	});
});
