import { UserEntity } from "@domain/entities/user.entity.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";
import type { User as PrismaUserModel, UserStatus } from "@prisma/client";

export const UserMapper = {
	toDomain(raw: PrismaUserModel): UserEntity {
		return UserEntity.reconstitute({
			id: raw.id,
			fullName: FullName.create(raw.fullname),
			phone: PhoneNumber.create(raw.phone),
			email: Email.create(raw.email),
			passwordHash: raw.passwordHash,
			googleId: raw.googleId,
			status: "ACTIVE",
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		});
	},

	toPersistence(entity: UserEntity): PrismaUserModel {
		return {
			id: entity.id,
			fullname: entity.fullName.getValue(),
			phone: entity.phone.getValue(),
			email: entity.email.getValue(),
			passwordHash: entity.passwordHash,
			googleId: entity.googleId,
			status: entity.status as UserStatus,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	},
};
