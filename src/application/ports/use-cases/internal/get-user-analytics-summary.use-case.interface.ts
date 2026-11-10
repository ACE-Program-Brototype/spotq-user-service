import type {
	UserAnalyticsSummaryQueryDto,
	UserAnalyticsSummaryResponseDto,
} from "@application/dtos/internal/user-analytics-summary.dto.ts";

export interface IGetUserAnalyticsSummaryUseCase {
	execute(
		query?: UserAnalyticsSummaryQueryDto,
	): Promise<UserAnalyticsSummaryResponseDto>;
}
