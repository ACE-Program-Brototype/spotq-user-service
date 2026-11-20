import type { AdminCustomerDetailsResponseDto } from "@application/dtos/admin/admin-customer-details.dto.ts";
import type { UserEntity } from "@domain/entities/user.entity.ts";

export const AdminCustomerDetailsMapper = {
	toResponse(user: UserEntity): AdminCustomerDetailsResponseDto {
		const createdAtIso = user.createdAt.toISOString();
		const updatedAtIso = user.updatedAt.toISOString();
		const fullNameStr = user.fullName.getValue();
		const phoneStr = user.phone ? user.phone.getValue() : null;

		return {
			id: user.id,
			fullName: fullNameStr,
			email: user.email.getValue(),
			phone: phoneStr,
			status: user.status,
			isEmailVerified: user.isEmailVerified,
			avatarUrl: null,
			createdAt: createdAtIso,
			updatedAt: updatedAtIso,
			location: user.profile?.location ?? null,
		};
	},
};

export const toAdminCustomerDetailsResponse =
	AdminCustomerDetailsMapper.toResponse;
