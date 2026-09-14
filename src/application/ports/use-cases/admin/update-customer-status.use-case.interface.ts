import type {
	UpdateCustomerStatusDto,
	UpdateCustomerStatusResponseDto,
} from "@application/dtos/admin/update-customer-status.dto.ts";

export interface IUpdateCustomerStatusUseCase {
	execute(
		dto: UpdateCustomerStatusDto,
	): Promise<UpdateCustomerStatusResponseDto>;
}
