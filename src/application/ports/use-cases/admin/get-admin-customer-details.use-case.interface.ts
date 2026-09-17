import type { AdminCustomerDetailsResponseDto } from "@application/dtos/admin/admin-customer-details.dto.ts";

export interface IGetAdminCustomerDetailsUseCase {
	execute(id: string): Promise<AdminCustomerDetailsResponseDto>;
}
