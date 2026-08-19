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
				.status(HttpStatus.UNPROCESSABLE_ENTITY)
				.json(
					ApiResponse.fail(
						errorMessage,
						HttpStatus.UNPROCESSABLE_ENTITY,
						"VALIDATION_ERROR",
					),
				);
			return;
		}

		req.body = result.data;
		next();
	};
};
