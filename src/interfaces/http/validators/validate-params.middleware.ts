import { HttpStatus } from "@shared/constants/http.constants.ts";
import { VALIDATION_MESSAGES } from "@shared/constants/index.ts";
import { ApiResponse } from "@shared/response/api-response.model.ts";
import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export const validateRequestParams = (schema: ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.params);

		if (!result.success) {
			const firstIssue = result.error.issues[0];
			const errorMessage = firstIssue
				? firstIssue.message
				: VALIDATION_MESSAGES.PARAMS.INVALID;

			res
				.status(HttpStatus.BAD_REQUEST)
				.json(
					ApiResponse.fail(errorMessage, HttpStatus.BAD_REQUEST, "BAD_REQUEST"),
				);
			return;
		}

		req.params = result.data as Record<string, string>;
		next();
	};
};
