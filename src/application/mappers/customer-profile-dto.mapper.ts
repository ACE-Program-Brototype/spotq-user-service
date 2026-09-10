import type { CustomerProfileResponseDto } from "@application/dtos/customer-profile-response.dto.ts";
import type { UserEntity } from "@domain/entities/user.entity.ts";

export const CustomerProfileDtoMapper = {
	toResponse(user: UserEntity): CustomerProfileResponseDto {
		const dobFormatted = user.profile?.dob
			? (user.profile.dob.toISOString().split("T")[0] ?? null)
			: null;

		return {
			id: user.id,
			full_name: user.fullName.getValue(),
			email: user.email.getValue(),
			phone: user.phone ? user.phone.getValue() : null,
			status: user.status,
			gender: user.profile?.gender ?? null,
			dob: dobFormatted,
			location: user.profile?.location ?? null,
			created_at: user.createdAt.toISOString(),
			updated_at: user.updatedAt.toISOString(),
		};
	},
};
