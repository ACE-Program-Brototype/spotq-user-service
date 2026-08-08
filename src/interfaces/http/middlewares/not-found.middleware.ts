import { HttpStatus } from "@shared/constants/http.constants.js";
import { ResponseMessage } from "@shared/constants/response-messages.constants.js";
import type { NextFunction, Request, Response } from "express";

export function notFoundMiddleware(
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
	res.status(HttpStatus.NOT_FOUND).json({
		error: ResponseMessage.NOT_FOUND,
		message: `Cannot ${req.method} ${req.path}`,
	});
}
