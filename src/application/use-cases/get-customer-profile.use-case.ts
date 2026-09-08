import type { CustomerProfileResponseDto } from "@application/dtos/customer-profile-response.dto.ts";
import { CustomerProfileMapper } from "@application/mappers/customer-profile.mapper.ts";
import type { IGetCustomerProfileUseCase } from "@application/ports/use-cases/get-customer-profile.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { UserNotFoundError } from "@domain/errors/user-not-found.error.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { inject, injectable } from "inversify";

/**
 * Use case to retrieve complete profile information for an authenticated customer.
 */
@injectable()
export class GetCustomerProfileUseCase implements IGetCustomerProfileUseCase {
	constructor(
		@inject(TYPES.UserRepository)
		private readonly userRepository: IUserRepository,
	) {}

	/**
	 * Executes the retrieval of customer profile by user ID.
	 *
	 * @param userId Unique identifier of the authenticated customer
	 * @returns Complete customer profile response data
	 */
	public async execute(userId: string): Promise<CustomerProfileResponseDto> {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new UserNotFoundError();
		}

		return CustomerProfileMapper.toDto(user);
	}
}
