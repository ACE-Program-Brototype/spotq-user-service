import type { UserStatus } from "../entities/user.entity.ts";

export type SortDirection = "ASC" | "DESC" | "asc" | "desc";

export interface CustomerQueryFilter {
	status?: UserStatus;
	search?: string;
	page: number;
	limit: number;
	sortBy: string;
	sortOrder: "ASC" | "DESC";
}

export interface PaginatedResult<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
