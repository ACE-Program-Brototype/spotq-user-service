import type { UserStatus } from "@domain/entities/user.entity.ts";
import type { SortDirection } from "@domain/types/customer-query.types.ts";

export interface ListCustomersQueryDto {
	status?: UserStatus;
	search?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: SortDirection;
}

export interface CustomerListItemDto {
	id: string;
	fullname: string;
	email: string;
	phone: string | null;
	status: UserStatus;
}

export interface PaginatedCustomersResponseDto {
	items: CustomerListItemDto[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
