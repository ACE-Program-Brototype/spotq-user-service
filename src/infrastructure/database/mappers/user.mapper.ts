import { UserEntity, type UserStatus } from "@domain/entities/user.entity.ts";
import { UserProfileEntity } from "@domain/entities/user-profile.entity.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";
import {
	type User as PrismaUserModel,
	type UserProfile as PrismaUserProfileModel,
	UserStatus as PrismaUserStatus,
} from "@prisma/client";

export type PrismaUserWithProfile = PrismaUserModel & {
	profile?: PrismaUserProfileModel | null;
};

export const UserMapper = {
	toDomain(raw: PrismaUserWithProfile): UserEntity {
		const profileEntity = raw.profile
			? UserProfileEntity.reconstitute({
					id: raw.profile.id,
					userId: raw.profile.userId,
					avatarUrl: raw.profile.avatarUrl,
					dob: raw.profile.dob,
					gender: raw.profile.gender,
					location: raw.profile.location,
					createdAt: raw.profile.createdAt,
					updatedAt: raw.profile.updatedAt,
				})
			: null;

		return UserEntity.reconstitute({
			id: raw.id,
			fullName: FullName.create(raw.fullname),
			phone: raw.phone ? PhoneNumber.create(raw.phone) : null,
			email: Email.create(raw.email),
			passwordHash: raw.passwordHash ?? "",
			googleId: raw.googleId,
			status: raw.status as UserStatus,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
			profile: profileEntity,
		});
	},

	toPersistence(entity: UserEntity): PrismaUserModel {
		return {
			id: entity.id,
			fullname: entity.fullName.getValue(),
			phone: entity.phone.getValue(),
			email: entity.email.getValue(),
			passwordHash: entity.passwordHash,
			googleId: entity.googleId ?? null,
			status: entity.status as PrismaUserStatus,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	},
};
