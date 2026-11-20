export type AnalyticsPeriod = "DAY" | "WEEK" | "MONTH" | "YEAR";

export interface UserAnalyticsSummaryQueryDto {
	period?: AnalyticsPeriod;
	day?: number;
	month?: number;
	year?: number;
}

export interface UserAnalyticsSummaryResponseDto {
	totalRegisteredCustomers: number;
	newCustomersInPeriod: number;
}
