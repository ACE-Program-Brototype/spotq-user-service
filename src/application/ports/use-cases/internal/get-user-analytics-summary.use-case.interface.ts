import type { UserAnalyticsSummaryResponseDto } from "@application/dtos/internal/user-analytics-summary.dto.ts";

export interface IGetUserAnalyticsSummaryUseCase {
	execute(): Promise<UserAnalyticsSummaryResponseDto>;
}
