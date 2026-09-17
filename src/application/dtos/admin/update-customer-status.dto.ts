import type { UserStatus } from "@domain/entities/user.entity.ts";

export interface UpdateCustomerStatusDto {
	userId: string;
	status: UserStatus;
}

export interface UpdateCustomerStatusResponseDto {
	id: string;
	status: UserStatus;
	updatedAt: string;
}
