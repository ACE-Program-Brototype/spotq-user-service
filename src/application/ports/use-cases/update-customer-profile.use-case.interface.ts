import type { CustomerProfileResponseDto } from "@application/dtos/customer-profile-response.dto.ts";
import type { UpdateCustomerProfileDto } from "@application/dtos/update-customer-profile.dto.ts";

/**
 * Interface port for updating customer profile information use case.
 */
export interface IUpdateCustomerProfileUseCase {
	/**
	 * Updates the personal profile for the specified customer.
	 *
	 * @param userId Unique identifier of the authenticated customer
	 * @param dto Profile fields to be updated
	 * @returns Complete updated customer profile response data
	 */
	execute(
		userId: string,
		dto: UpdateCustomerProfileDto,
	): Promise<CustomerProfileResponseDto>;
}
