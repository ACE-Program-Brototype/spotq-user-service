import type { IGetUserAnalyticsSummaryUseCase } from "@application/ports/use-cases/internal/get-user-analytics-summary.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ResponseMessage } from "@shared/constants/response-messages.constants.ts";
import { sendSuccessResponse } from "@shared/response/index.ts";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class InternalUserAnalyticsController {
	constructor(
		@inject(TYPES.GetUserAnalyticsSummaryUseCase)
		private readonly getUserAnalyticsSummaryUseCase: IGetUserAnalyticsSummaryUseCase,
	) {}

	public getUserSummary = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const summary = await this.getUserAnalyticsSummaryUseCase.execute();
			sendSuccessResponse(
				res,
				summary,
				ResponseMessage.USER_ANALYTICS_SUMMARY_FETCH_SUCCESS,
				HttpStatus.OK,
			);
		} catch (error) {
			next(error);
		}
	};
}
