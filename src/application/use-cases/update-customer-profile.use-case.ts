import type { CustomerProfileResponseDto } from "@application/dtos/customer-profile-response.dto.ts";
import type { UpdateCustomerProfileDto } from "@application/dtos/update-customer-profile.dto.ts";
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

		const fullNameStr = existingUser.fullName.getValue();
		const nameParts = fullNameStr.trim().split(/\s+/);
		const existingFirstName = nameParts[0] || fullNameStr;
		const existingLastName =
			nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

		let updatedFullName: string | undefined;

		if (dto.first_name !== undefined || dto.last_name !== undefined) {
			const nextFirstName =
				dto.first_name !== undefined
					? dto.first_name.trim()
					: existingFirstName;

			const nextLastName =
				dto.last_name !== undefined
					? dto.last_name
						? dto.last_name.trim()
						: null
					: existingLastName;

			const composedFullName = [nextFirstName, nextLastName]
				.filter(Boolean)
				.join(" ");

			const validatedFullName = FullName.create(composedFullName);
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

		const updatedFullNameStr = updatedUser.fullName.getValue();
		const updatedNameParts = updatedFullNameStr.trim().split(/\s+/);
		const resultFirstName = updatedNameParts[0] || updatedFullNameStr;
		const resultLastName =
			updatedNameParts.length > 1 ? updatedNameParts.slice(1).join(" ") : null;

		const dobFormatted = updatedUser.profile?.dob
			? (updatedUser.profile.dob.toISOString().split("T")[0] ?? null)
			: null;

		return {
			id: updatedUser.id,
			first_name: resultFirstName,
			last_name: resultLastName,
			full_name: updatedFullNameStr,
			email: updatedUser.email.getValue(),
			phone: updatedUser.phone ? updatedUser.phone.getValue() : null,
			status: updatedUser.status,
			gender: updatedUser.profile?.gender ?? null,
			dob: dobFormatted,
			location: updatedUser.profile?.location ?? null,
			default_address: null,
			created_at: updatedUser.createdAt.toISOString(),
			updated_at: updatedUser.updatedAt.toISOString(),
		};
	}
}
