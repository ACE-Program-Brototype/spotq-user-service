import type { AdminCustomerDetailsResponseDto } from "@application/dtos/admin/admin-customer-details.dto.ts";
import type { UserEntity } from "@domain/entities/user.entity.ts";

export const AdminCustomerDetailsMapper = {
	toResponse(user: UserEntity): AdminCustomerDetailsResponseDto {
		const dobFormatted = user.profile?.dob
			? (user.profile.dob.toISOString().split("T")[0] ?? null)
			: null;
		const createdAtIso = user.createdAt.toISOString();
		const updatedAtIso = user.updatedAt.toISOString();
		const fullNameStr = user.fullName.getValue();
		const phoneStr = user.phone ? user.phone.getValue() : null;

		return {
			id: user.id,
			full_name: fullNameStr,
			fullName: fullNameStr,
			fullname: fullNameStr,
			email: user.email.getValue(),
			phone: phoneStr,
			status: user.status,
			is_email_verified: user.isEmailVerified,
			isEmailVerified: user.isEmailVerified,
			gender: user.profile?.gender ?? null,
			dob: dobFormatted,
			location: user.profile?.location ?? null,
			avatar_url: null,
			avatarUrl: null,
			created_at: createdAtIso,
			createdAt: createdAtIso,
			updated_at: updatedAtIso,
			updatedAt: updatedAtIso,
		};
	},
};

export const toAdminCustomerDetailsResponse =
	AdminCustomerDetailsMapper.toResponse;
