import {
	validateRequestBody,
	validateRequestParams,
	validateRequestQuery,
} from "@interfaces/http/validators/validate-request.middleware.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

describe("validate-request.middleware", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		mockReq = {};
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		mockNext = jest.fn();
	});

	describe("validateRequestBody", () => {
		const schema = z.object({
			name: z.string({ message: "Name is required." }),
		});

		it("should call next() and assign parsed data on success", () => {
			mockReq.body = { name: "Alice" };
			const middleware = validateRequestBody(schema);

			middleware(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
			expect(mockReq.body).toEqual({ name: "Alice" });
		});

		it("should return 400 Bad Request on validation failure", () => {
			mockReq.body = {};
			const middleware = validateRequestBody(schema);

			middleware(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
			expect(mockRes.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					statusCode: HttpStatus.BAD_REQUEST,
					error: "VALIDATION_ERROR",
					message: "Name is required.",
				}),
			);
		});
	});

	describe("validateRequestParams", () => {
		const schema = z.object({
			userId: z.string().uuid({ message: "Invalid user ID." }),
		});

		it("should call next() and assign validatedParams on success", () => {
			mockReq.params = { userId: "123e4567-e89b-12d3-a456-426614174000" };
			const middleware = validateRequestParams(schema);

			middleware(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
			expect(
				(mockReq as Request & { validatedParams?: unknown }).validatedParams,
			).toEqual({ userId: "123e4567-e89b-12d3-a456-426614174000" });
		});

		it("should return 400 Bad Request on invalid params", () => {
			mockReq.params = { userId: "invalid-uuid" };
			const middleware = validateRequestParams(schema);

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

	describe("validateRequestQuery", () => {
		const schema = z.object({
			page: z.preprocess((val) => Number(val), z.number().int().positive()),
		});

		it("should call next() and assign validatedQuery on success", () => {
			mockReq.query = { page: "2" };
			const middleware = validateRequestQuery(schema);

			middleware(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
			expect(
				(mockReq as Request & { validatedQuery?: unknown }).validatedQuery,
			).toEqual({ page: 2 });
		});

		it("should return 400 Bad Request on invalid query", () => {
			mockReq.query = { page: "-5" };
			const middleware = validateRequestQuery(schema);

			middleware(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
			expect(mockRes.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					statusCode: HttpStatus.BAD_REQUEST,
					error: "VALIDATION_ERROR",
				}),
			);
		});
	});
});
