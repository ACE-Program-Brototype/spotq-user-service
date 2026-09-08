import type { CustomerProfileResponseDto } from "@application/dtos/customer-profile-response.dto.ts";
import type { UserEntity } from "@domain/entities/user.entity.ts";

/**
 * Mapper responsible for transforming User domain entities into CustomerProfileResponseDto.
 */
export const CustomerProfileMapper = {
	toDto(user: UserEntity): CustomerProfileResponseDto {
		const fullNameStr = user.fullName.getValue();
		const nameParts = fullNameStr.trim().split(/\s+/);
		const firstName = nameParts[0] || fullNameStr;
		const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

		const dobFormatted = user.profile?.dob
			? (user.profile.dob.toISOString().split("T")[0] ?? null)
			: null;

		return {
			id: user.id,
			first_name: firstName,
			last_name: lastName,
			full_name: fullNameStr,
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
