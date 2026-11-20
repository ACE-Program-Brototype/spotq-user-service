import type { NextFunction, Request, Response } from "express";

export interface IInternalUserAnalyticsController {
	getUserSummary(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void>;
}
