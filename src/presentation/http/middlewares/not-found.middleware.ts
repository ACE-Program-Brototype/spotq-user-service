import { HttpStatus, ResponseMessage } from "@shared/constants/index.ts";
import type { NextFunction, Request, Response } from "express";

export function notFoundMiddleware(
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
	res.status(HttpStatus.NOT_FOUND).json({
		success: false,
		message: `Cannot ${req.method} ${req.path}`,
		error: ResponseMessage.REQ_ROUTE_NOT_FOUND,
	});
}
