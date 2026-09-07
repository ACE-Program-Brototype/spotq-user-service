import type { CustomerProfileResponseDto } from "@application/dtos/customer-profile-response.dto.ts";
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

		const fullNameStr = user.fullName.getValue();
		const nameParts = fullNameStr.trim().split(/\s+/);
		const firstName = nameParts[0] || fullNameStr;
		const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

		const dobFormatted = user.profile?.dob
			? (user.profile.dob.toISOString().split("T")[0] ?? null)
			: null;

		return {
			id: user.id,
			first_name: firstName,
			last_name: lastName,
			full_name: fullNameStr,
			email: user.email.getValue(),
			phone: user.phone ? user.phone.getValue() : null,
			status: user.status,
			avatar_url: user.profile?.avatarUrl ?? null,
			gender: user.profile?.gender ?? null,
			dob: dobFormatted,
			location: user.profile?.location ?? null,
			default_address: null,
			created_at: user.createdAt.toISOString(),
			updated_at: user.updatedAt.toISOString(),
		};
	}
}
