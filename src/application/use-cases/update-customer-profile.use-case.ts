import type { CustomerProfileResponseDto } from "@application/dtos/customer-profile-response.dto.ts";
import type { UpdateCustomerProfileDto } from "@application/dtos/update-customer-profile.dto.ts";
import { CustomerProfileMapper } from "@application/mappers/customer-profile.mapper.ts";
import type { IUpdateCustomerProfileUseCase } from "@application/ports/use-cases/update-customer-profile.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { UserNotFoundError } from "@domain/errors/user-not-found.error.ts";
import type {
	IUserRepository,
	UpdateUserProfileParams,
} from "@domain/repositories/user.repository.interface.ts";
import { FullName } from "@domain/value-objects/index.ts";
import { inject, injectable } from "inversify";

/**
 * Use case to update personal profile information for an authenticated customer.
 */
@injectable()
export class UpdateCustomerProfileUseCase
	implements IUpdateCustomerProfileUseCase
{
	constructor(
		@inject(TYPES.UserRepository)
		private readonly userRepository: IUserRepository,
	) {}

	/**
	 * Executes the update of customer profile data.
	 *
	 * @param userId Unique identifier of the authenticated customer
	 * @param dto Profile fields to be updated
	 * @returns Complete updated customer profile response data
	 */
	public async execute(
		userId: string,
		dto: UpdateCustomerProfileDto,
	): Promise<CustomerProfileResponseDto> {
		const existingUser = await this.userRepository.findById(userId);

		if (!existingUser) {
			throw new UserNotFoundError();
		}

		let updatedFullName: string | undefined;

		if (dto.full_name !== undefined) {
			const validatedFullName = FullName.create(dto.full_name.trim());
			updatedFullName = validatedFullName.getValue();
		}

		const updateParams: UpdateUserProfileParams = {
			userId,
		};

		if (updatedFullName !== undefined) {
			updateParams.fullName = updatedFullName;
		}

		if (dto.dob !== undefined) {
			updateParams.dob = dto.dob ? new Date(dto.dob) : null;
		}

		if (dto.gender !== undefined) {
			updateParams.gender = dto.gender;
		}

		if (dto.location !== undefined) {
			updateParams.location = dto.location;
		}

		const updatedUser = await this.userRepository.updateProfile(updateParams);

		return CustomerProfileMapper.toDto(updatedUser);
	}
}
