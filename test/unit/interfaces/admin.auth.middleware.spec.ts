import { container } from "@config/di";
import type { JwtTokenService } from "@infrastructure/services/token";
import {
	adminAuthMiddleware,
	adminTempTokenCheck,
} from "@interfaces/http/middlewares/admin.auth.middleware.ts";
import type { AuthenticatedRequest } from "@interfaces/http/middlewares/auth.middleware.ts";
import { authConstants } from "@shared/constants/auth.constants.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ApiResponse } from "@shared/response/api-response.model.ts";
import { AppError } from "@shared/util/app.error";
import type { NextFunction, Request, Response } from "express";

describe("admin.auth.middleware", () => {
	describe("adminAuthMiddleware", () => {
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

		it("should return 401 when x-user-id header is missing", () => {
			adminAuthMiddleware(
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

		it("should return 401 when x-user-id is empty whitespace", () => {
			mockReq.headers = { "x-user-id": "   " };

			adminAuthMiddleware(
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

		it("should return 403 when x-user-role is not admin", () => {
			mockReq.headers = {
				"x-user-id": "user-123",
				"x-user-role": "customer",
			};

			adminAuthMiddleware(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext,
			);

			expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
			expect(mockRes.json).toHaveBeenCalledWith(
				ApiResponse.fail(
					authConstants.ADMIN_FORBIDDEN,
					HttpStatus.FORBIDDEN,
					"FORBIDDEN",
				),
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 403 when x-user-role is missing", () => {
			mockReq.headers = {
				"x-user-id": "user-123",
			};

			adminAuthMiddleware(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext,
			);

			expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
			expect(mockRes.json).toHaveBeenCalledWith(
				ApiResponse.fail(
					authConstants.ADMIN_FORBIDDEN,
					HttpStatus.FORBIDDEN,
					"FORBIDDEN",
				),
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should set req.user and req.userId and call next when user is admin", () => {
			mockReq.headers = {
				"x-user-id": "admin-123",
				"x-user-role": "admin",
				"x-user-email": "admin@example.com",
			};

			adminAuthMiddleware(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext,
			);

			expect(mockReq.user).toEqual({
				userId: "admin-123",
				email: "admin@example.com",
				role: "admin",
			});
			expect(mockReq.userId).toBe("admin-123");
			expect(mockNext).toHaveBeenCalled();
		});

		it("should accept uppercase ADMIN role case-insensitively", () => {
			mockReq.headers = {
				"x-user-id": "admin-456",
				"x-user-role": "ADMIN",
				"x-user-email": "admin@example.com",
			};

			adminAuthMiddleware(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext,
			);

			expect(mockReq.user).toEqual({
				userId: "admin-456",
				email: "admin@example.com",
				role: "ADMIN",
			});
			expect(mockReq.userId).toBe("admin-456");
			expect(mockNext).toHaveBeenCalled();
		});
	});

	describe("adminTempTokenCheck", () => {
		let mockReq: Partial<Request>;
		let mockRes: Partial<Response>;
		let mockNext: jest.MockedFunction<NextFunction>;

		beforeEach(() => {
			mockReq = {
				cookies: {},
			};
			mockRes = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn().mockReturnThis(),
			};
			mockNext = jest.fn();
		});

		it("should throw AppError with BAD_REQUEST if tempToken is missing in cookies", async () => {
			await expect(
				adminTempTokenCheck(mockReq as Request, mockRes as Response, mockNext),
			).rejects.toThrow(AppError);
		});

		it("should throw AppError with UNAUTHORIZED if tempToken verification fails", async () => {
			mockReq.cookies = { tempToken: "invalid_token" };
			const mockTokenService: Partial<JwtTokenService> = {
				verifyTempToken: jest.fn().mockImplementation(() => {
					throw new Error("Invalid token");
				}),
			};

			jest
				.spyOn(container, "get")
				.mockReturnValue(mockTokenService as JwtTokenService);

			await expect(
				adminTempTokenCheck(mockReq as Request, mockRes as Response, mockNext),
			).rejects.toThrow(AppError);
		});

		it("should throw AppError with UNAUTHORIZED if token role is not admin", async () => {
			mockReq.cookies = { tempToken: "valid_token" };
			const mockTokenService: Partial<JwtTokenService> = {
				verifyTempToken: jest.fn().mockReturnValue({
					userId: "usr-1",
					role: "customer",
				}),
			};

			jest
				.spyOn(container, "get")
				.mockReturnValue(mockTokenService as JwtTokenService);

			await expect(
				adminTempTokenCheck(mockReq as Request, mockRes as Response, mockNext),
			).rejects.toThrow(AppError);
		});

		it("should set req.userId and call next when tempToken is valid for admin", async () => {
			mockReq.cookies = { tempToken: "valid_token" };
			const mockTokenService: Partial<JwtTokenService> = {
				verifyTempToken: jest.fn().mockReturnValue({
					userId: "admin-1",
					role: "admin",
				}),
			};

			jest
				.spyOn(container, "get")
				.mockReturnValue(mockTokenService as JwtTokenService);

			await adminTempTokenCheck(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockReq.userId).toBe("admin-1");
			expect(mockNext).toHaveBeenCalled();
		});
	});
});
