import type { NextFunction, Request, RequestHandler, Response } from "express";

export const asyncHandler = (
	fn: (req: any, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler => {
	return (req, res, next) => {
		return Promise.resolve(fn(req, res, next)).catch(next);
	};
};
