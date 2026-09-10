import type { CustomerListItemDto } from "@application/dtos/admin/list-customers.dto.ts";
import type { UserEntity } from "@domain/entities/user.entity.ts";

export const CustomerListDtoMapper = {
	toListItem(user: UserEntity): CustomerListItemDto {
		return {
			id: user.id,
			fullname: user.fullName.getValue(),
			email: user.email.getValue(),
			phone: user.phone ? user.phone.getValue() : null,
			status: user.status,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
		};
	},
};
