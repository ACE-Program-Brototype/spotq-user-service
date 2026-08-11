import { HttpStatus, ResponseMessage } from "@shared/constants/index.js";
import { ApiResponse } from "@shared/response/index.js";
import type { NextFunction, Request, Response } from "express";

export function notFoundMiddleware(
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
	const response = ApiResponse.fail(
		`Cannot ${req.method} ${req.path}`,
		HttpStatus.NOT_FOUND,
		ResponseMessage.REQ_ROUTE_NOT_FOUND,
	);
	res.status(response.statusCode).json(response);
}
