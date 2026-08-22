import { HttpStatus } from "@shared/constants/http.constants.ts";
import type { NextFunction, Request, Response } from "express";
import { ZodError, type z } from "zod";

export const validate = (schema: z.ZodType) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			req.body = schema.parse(req.body);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(HttpStatus.BAD_REQUEST).json({
					success: false,
					message: "Validation failed",
					errors: error.issues,
				});
			}

			next(error);
		}
	};
};
