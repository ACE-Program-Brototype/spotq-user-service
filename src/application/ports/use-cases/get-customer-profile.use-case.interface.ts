import type { CustomerProfileResponseDto } from "../../dtos/customer-profile-response.dto.ts";
import type { IUseCase } from "./base.use-case.interface.ts";

/**
 * Port interface for the GetCustomerProfile use case.
 */
export interface IGetCustomerProfileUseCase
	extends IUseCase<string, CustomerProfileResponseDto> {
	execute(userId: string): Promise<CustomerProfileResponseDto>;
}
