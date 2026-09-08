import type { CustomerProfileResponseDto } from "@application/dtos/customer-profile-response.dto.ts";
import type { UserEntity } from "@domain/entities/user.entity.ts";

/**
 * Mapper responsible for transforming User domain entities into CustomerProfileResponseDto.
 */
export const CustomerProfileMapper = {
	toDto(user: UserEntity): CustomerProfileResponseDto {
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
			default_address: null,
			created_at: user.createdAt.toISOString(),
			updated_at: user.updatedAt.toISOString(),
		};
	},
};
