import type {
	AnalyticsPeriod,
	UserAnalyticsSummaryQueryDto,
} from "@application/dtos/internal/user-analytics-summary.dto.ts";
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
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const period =
				typeof req.query.period === "string"
					? (req.query.period.toUpperCase() as AnalyticsPeriod)
					: undefined;
			const day = req.query.day ? Number(req.query.day) : undefined;
			const month = req.query.month ? Number(req.query.month) : undefined;
			const year = req.query.year ? Number(req.query.year) : undefined;

			const query: UserAnalyticsSummaryQueryDto = {
				...(period && { period }),
				...(day !== undefined && !Number.isNaN(day) && { day }),
				...(month !== undefined && !Number.isNaN(month) && { month }),
				...(year !== undefined && !Number.isNaN(year) && { year }),
			};

			const summary =
				await this.getUserAnalyticsSummaryUseCase.execute(query);
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
