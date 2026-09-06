import type { UserEntity } from "@domain/entities/user.entity.ts";
import type { LoginUserResponseDto } from "../dtos/login.dto.ts";
import type { VerifiedUserResponseDto } from "../dtos/verify-email-otp.dto.ts";

export const UserDtoMapper = {
	toVerifiedUserResponse(entity: UserEntity): VerifiedUserResponseDto {
		return {
			id: entity.id,
			fullName: entity.fullName.getValue(),
			email: entity.email.getValue(),
			phoneNumber: entity.phone ? entity.phone.getValue() : "",
			status: entity.status,
			createdAt: entity.createdAt.toISOString(),
		};
	},

	toGoogleAuthUserResponse(entity: UserEntity) {
		return {
			id: entity.id,
			fullName: entity.fullName.getValue(),
			email: entity.email.getValue(),
			status: entity.status,
		};
	},

	toLoginResponse(entity: UserEntity): LoginUserResponseDto {
		return {
			id: entity.id,

			full_name: entity.fullName.getValue(),
			email: entity.email.getValue(),
			phone: entity.phone ? entity.phone.getValue() : "",
			status: entity.status,
			created_at: entity.createdAt.toISOString(),
			updated_at: entity.updatedAt.toISOString(),
		};
	},
};
