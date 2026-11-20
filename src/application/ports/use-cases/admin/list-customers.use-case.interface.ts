import type {
	ListCustomersQueryDto,
	PaginatedCustomersResponseDto,
} from "@application/dtos/admin/list-customers.dto.ts";

export interface IListCustomersUseCase {
	execute(query: ListCustomersQueryDto): Promise<PaginatedCustomersResponseDto>;
}
