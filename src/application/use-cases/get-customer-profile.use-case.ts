import type { CustomerProfileResponseDto } from "@application/dtos/customer-profile-response.dto.ts";
import { CustomerProfileDtoMapper } from "@application/mappers/customer-profile-dto.mapper.ts";
import type { IGetCustomerProfileUseCase } from "@application/ports/use-cases/get-customer-profile.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { UserStatus } from "@domain/entities/user.entity.ts";
import {
	UserBlockedError,
	UserInactiveError,
	UserNotFoundError,
} from "@domain/errors/index.ts";
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

		if (user.status === UserStatus.BLOCKED) {
			throw new UserBlockedError();
		}

		if (user.status === UserStatus.INACTIVE) {
			throw new UserInactiveError();
		}

		return CustomerProfileDtoMapper.toResponse(user);
	}
}
