import type { UserAnalyticsSummaryResponseDto } from "@application/dtos/internal/user-analytics-summary.dto.ts";
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

	public async execute(): Promise<UserAnalyticsSummaryResponseDto> {
		const totalRegisteredCustomers = await this.userRepository.countCustomers(
			{},
		);
		return { totalRegisteredCustomers };
	}
}
