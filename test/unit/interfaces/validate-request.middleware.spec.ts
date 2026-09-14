import {
	validateRequestBody,
	validateRequestParams,
	validateRequestQuery,
} from "@interfaces/http/validators/validate-request.middleware.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ApiResponse } from "@shared/response/api-response.model.ts";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

describe("validate-request.middleware", () => {
	const dummySchema = z.object({
		name: z.string().min(2, "Name too short"),
	});

	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: jest.MockedFunction<NextFunction>;

	beforeEach(() => {
		mockReq = {};
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		mockNext = jest.fn();
	});

	describe("validateRequestBody", () => {
		it("should return 422 UNPROCESSABLE_ENTITY on validation failure", () => {
			mockReq.body = { name: "a" };

			const middleware = validateRequestBody(dummySchema);
			middleware(mockReq as Request, mockRes as Response, mockNext);

			expect(mockRes.status).toHaveBeenCalledWith(
				HttpStatus.UNPROCESSABLE_ENTITY,
			);
			expect(mockRes.json).toHaveBeenCalledWith(
				ApiResponse.fail(
					"Name too short",
					HttpStatus.UNPROCESSABLE_ENTITY,
					"VALIDATION_ERROR",
				),
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should call next() on valid request body", () => {
			mockReq.body = { name: "Alice" };

			const middleware = validateRequestBody(dummySchema);
			middleware(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
		});
	});

	describe("validateRequestQuery", () => {
		it("should return 400 BAD_REQUEST on validation failure per SCRUM-57", () => {
			mockReq.query = { name: "a" };

			const middleware = validateRequestQuery(dummySchema);
			middleware(mockReq as Request, mockRes as Response, mockNext);

			expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
			expect(mockRes.json).toHaveBeenCalledWith(
				ApiResponse.fail(
					"Name too short",
					HttpStatus.BAD_REQUEST,
					"VALIDATION_ERROR",
				),
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should call next() on valid request query", () => {
			mockReq.query = { name: "Alice" };

			const middleware = validateRequestQuery(dummySchema);
			middleware(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
			expect(
				(mockReq as Request & { validatedQuery?: unknown }).validatedQuery,
			).toEqual({
				name: "Alice",
			});
		});
	});

	describe("validateRequestParams", () => {
		const paramSchema = z.object({
			userId: z.string().uuid({ message: "Invalid user ID." }),
		});

		it("should call next() and assign validatedParams on success", () => {
			mockReq.params = { userId: "123e4567-e89b-12d3-a456-426614174000" };
			const middleware = validateRequestParams(paramSchema);

			middleware(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
			expect(
				(mockReq as Request & { validatedParams?: unknown }).validatedParams,
			).toEqual({ userId: "123e4567-e89b-12d3-a456-426614174000" });
		});

		it("should return 400 Bad Request on invalid params", () => {
			mockReq.params = { userId: "invalid-uuid" };
			const middleware = validateRequestParams(paramSchema);

			middleware(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
			expect(mockRes.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					statusCode: HttpStatus.BAD_REQUEST,
					error: "VALIDATION_ERROR",
					message: "Invalid user ID.",
				}),
			);
		});
	});
});
