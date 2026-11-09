import type {
	AnalyticsPeriod,
	UserAnalyticsSummaryQueryDto,
	UserAnalyticsSummaryResponseDto,
} from "@application/dtos/internal/user-analytics-summary.dto.ts";
import type { IGetUserAnalyticsSummaryUseCase } from "@application/ports/use-cases/internal/get-user-analytics-summary.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { inject, injectable } from "inversify";

@injectable()
export class GetUserAnalyticsSummaryUseCase
	implements IGetUserAnalyticsSummaryUseCase
{
	constructor(
		@inject(TYPES.UserRepository)
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(
		query?: UserAnalyticsSummaryQueryDto,
	): Promise<UserAnalyticsSummaryResponseDto> {
		const { startDate, endDate } = this.resolveDateRange(query);

		const [totalRegisteredCustomers, newCustomersInPeriod] =
			await Promise.all([
				this.userRepository.countCustomers({}),
				this.userRepository.countCustomers({
					createdAt: {
						gte: startDate,
						lte: endDate,
					},
				}),
			]);

		return {
			totalRegisteredCustomers,
			newCustomersInPeriod,
		};
	}

	private resolveDateRange(query?: UserAnalyticsSummaryQueryDto): {
		startDate: Date;
		endDate: Date;
	} {
		const now = new Date();

		if (!query?.period) {
			// Default fallback: today from 00:00:00 to now
			const startDate = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				0,
				0,
				0,
				0,
			);
			return { startDate, endDate: now };
		}

		const period = query.period.toUpperCase() as AnalyticsPeriod;
		const targetYear = query.year ?? now.getFullYear();

		switch (period) {
			case "DAY": {
				const targetMonth = query.month ? query.month - 1 : now.getMonth();
				const targetDay = query.day ?? now.getDate();
				const startDate = new Date(
					targetYear,
					targetMonth,
					targetDay,
					0,
					0,
					0,
					0,
				);
				const endDate = new Date(
					targetYear,
					targetMonth,
					targetDay,
					23,
					59,
					59,
					999,
				);
				return { startDate, endDate };
			}

			case "WEEK": {
				const targetMonth = query.month ? query.month - 1 : now.getMonth();
				const targetDay = query.day ?? now.getDate();
				const target = new Date(targetYear, targetMonth, targetDay);
				const dayOfWeek = target.getDay();
				const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

				const monday = new Date(target);
				monday.setDate(target.getDate() + diffToMonday);
				const startDate = new Date(
					monday.getFullYear(),
					monday.getMonth(),
					monday.getDate(),
					0,
					0,
					0,
					0,
				);

				const sunday = new Date(monday);
				sunday.setDate(monday.getDate() + 6);
				const endDate = new Date(
					sunday.getFullYear(),
					sunday.getMonth(),
					sunday.getDate(),
					23,
					59,
					59,
					999,
				);
				return { startDate, endDate };
			}

			case "MONTH": {
				const targetMonth = query.month ? query.month - 1 : now.getMonth();
				const startDate = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
				const endDate = new Date(
					targetYear,
					targetMonth + 1,
					0,
					23,
					59,
					59,
					999,
				);
				return { startDate, endDate };
			}

			case "YEAR": {
				const startDate = new Date(targetYear, 0, 1, 0, 0, 0, 0);
				const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
				return { startDate, endDate };
			}

			default: {
				const startDate = new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
					0,
					0,
					0,
					0,
				);
				return { startDate, endDate: now };
			}
		}
	}
}
