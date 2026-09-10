import type {
	ListCustomersQueryDto,
	PaginatedCustomersResponseDto,
} from "@application/dtos/admin/list-customers.dto.ts";
import { CustomerListDtoMapper } from "@application/mappers/admin/customer-list-dto.mapper.ts";
import type { IListCustomersUseCase } from "@application/ports/use-cases/admin/list-customers.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { config } from "@config/env.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { inject, injectable } from "inversify";

@injectable()
export class ListCustomersUseCase implements IListCustomersUseCase {
	constructor(
		@inject(TYPES.UserRepository)
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(
		query: ListCustomersQueryDto,
	): Promise<PaginatedCustomersResponseDto> {
		const page =
			query.page && query.page > 0
				? query.page
				: config.pagination.users.defaultPage;
		const limit =
			query.limit && query.limit > 0
				? Math.min(query.limit, config.pagination.users.maxLimit)
				: config.pagination.users.defaultLimit;
		const sortBy = query.sortBy || config.pagination.users.defaultSortBy;
		const sortOrder = query.sortOrder
			? (query.sortOrder.toUpperCase() as "ASC" | "DESC")
			: config.pagination.users.defaultSortOrder;

		const skip = (page - 1) * limit;
		const take = limit;

		const [users, total] = await Promise.all([
			this.userRepository.findCustomers({
				status: query.status,
				search: query.search,
				skip,
				take,
				sortBy,
				sortOrder,
			}),
			this.userRepository.countCustomers({
				status: query.status,
				search: query.search,
			}),
		]);

		const items = users.map((user) => CustomerListDtoMapper.toListItem(user));
		const totalPages = Math.ceil(total / limit) || 0;

		return {
			items,
			total,
			page,
			limit,
			totalPages,
		};
	}
}
