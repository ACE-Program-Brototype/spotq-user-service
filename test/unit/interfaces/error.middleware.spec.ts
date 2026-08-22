import {
	EmailAlreadyExistsError,
	InvalidPasswordError,
	UserNotFoundError,
} from "@domain/errors/domain.error.ts";
import { errorMiddleware } from "@interfaces/http/middlewares/error.middleware.ts";
import type { NextFunction, Request, Response } from "express";

describe("errorMiddleware", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: jest.MockedFunction<NextFunction>;

	beforeEach(() => {
		mockReq = {
			method: "POST",
			url: "/test",
			body: {},
		};
		mockRes = {
			statusCode: 200,
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		mockNext = jest.fn();
	});

	it("should handle domain conflict errors with status 409", () => {
		const error = new EmailAlreadyExistsError();

		errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(409);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 409,
				error: "EMAIL_ALREADY_EXISTS",
			}),
		);
	});

	it("should handle domain validation errors with status 422", () => {
		const error = new InvalidPasswordError("Password is too weak.");

		errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(422);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 422,
				error: "INVALID_PASSWORD",
			}),
		);
	});

	it("should handle domain not found errors with status 404", () => {
		const error = new UserNotFoundError();

		errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(404);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 404,
				error: "USER_NOT_FOUND",
			}),
		);
	});

	it("should handle unhandled errors with status 500", () => {
		const error = new Error("Unexpected crash");

		errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(500);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 500,
			}),
		);
	});
});
