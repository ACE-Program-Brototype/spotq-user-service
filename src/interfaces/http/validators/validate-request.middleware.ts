import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ApiResponse } from "@shared/response/api-response.model.ts";
import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export const validateRequestBody = (schema: ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			const firstIssue = result.error.issues[0];
			const errorMessage = firstIssue
				? firstIssue.message
				: "Validation failed.";

			res
				.status(HttpStatus.BAD_REQUEST)
				.json(
					ApiResponse.fail(
						errorMessage,
						HttpStatus.BAD_REQUEST,
						"VALIDATION_ERROR",
					),
				);
			return;
		}

		req.body = result.data;
		next();
	};
};

export const validateRequestQuery = (schema: ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.query);

		if (!result.success) {
			const firstIssue = result.error.issues[0];
			const errorMessage = firstIssue
				? firstIssue.message
				: "Validation failed.";

			res
				.status(HttpStatus.BAD_REQUEST)
				.json(
					ApiResponse.fail(
						errorMessage,
						HttpStatus.BAD_REQUEST,
						"VALIDATION_ERROR",
					),
				);
			return;
		}

		if (req.query && typeof req.query === "object") {
			Object.assign(req.query, result.data);
		}
		(req as Request & { validatedQuery?: unknown }).validatedQuery =
			result.data;
		next();
	};
};

export const validateRequestParams = (schema: ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.params);

		if (!result.success) {
			const firstIssue = result.error.issues[0];
			const errorMessage = firstIssue
				? firstIssue.message
				: "Validation failed.";

			res
				.status(HttpStatus.BAD_REQUEST)
				.json(
					ApiResponse.fail(
						errorMessage,
						HttpStatus.BAD_REQUEST,
						"VALIDATION_ERROR",
					),
				);
			return;
		}

		if (req.params && typeof req.params === "object") {
			Object.assign(req.params, result.data);
		}
		(req as Request & { validatedParams?: unknown }).validatedParams =
			result.data;
		next();
	};
};
