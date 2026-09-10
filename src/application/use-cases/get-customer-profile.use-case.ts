import type { CustomerProfileResponseDto } from "@application/dtos/customer-profile-response.dto.ts";
import { CustomerProfileDtoMapper } from "@application/mappers/customer-profile-dto.mapper.ts";
import type { IGetCustomerProfileUseCase } from "@application/ports/use-cases/get-customer-profile.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { UserNotFoundError } from "@domain/errors/user-not-found.error.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { inject, injectable } from "inversify";

@injectable()
export class GetCustomerProfileUseCase implements IGetCustomerProfileUseCase {
	constructor(
		@inject(TYPES.UserRepository)
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(userId: string): Promise<CustomerProfileResponseDto> {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new UserNotFoundError();
		}

		return CustomerProfileDtoMapper.toResponse(user);
	}
}
