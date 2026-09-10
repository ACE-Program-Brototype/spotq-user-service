import type { DeviceEntity } from "../entities/device.entity.ts";
import type { RefreshTokenEntity } from "../entities/refresh-token.entity.ts";
import type { UserEntity, UserStatus } from "../entities/user.entity.ts";
import type { Email } from "../value-objects/email.vo.ts";
import type { PhoneNumber } from "../value-objects/phone-number.vo.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface CreateUserWithSessionParams {
	user: UserEntity;
	device?: DeviceEntity | null;
	refreshToken: RefreshTokenEntity;
}

export interface UpdateUserProfileParams {
	userId: string;
	fullName?: string;
	dob?: Date | null;
	gender?: string | null;
	location?: string | null;
}

export interface FindCustomersParams {
	status?: UserStatus;
	search?: string;
	skip: number;
	take: number;
	sortBy: string;
	sortOrder: "ASC" | "DESC";
}

export interface CountCustomersParams {
	status?: UserStatus;
	search?: string;
}

export interface IUserRepository extends IBaseRepository<UserEntity> {
	findByEmail(email: Email | string): Promise<UserEntity | null>;
	findByPhone(phone: PhoneNumber | string): Promise<UserEntity | null>;
	findByGoogleId(googleId: string): Promise<UserEntity | null>;
	createWithSession(params: CreateUserWithSessionParams): Promise<UserEntity>;
	updateProfile(params: UpdateUserProfileParams): Promise<UserEntity>;
	findCustomers(params: FindCustomersParams): Promise<UserEntity[]>;
	countCustomers(params: CountCustomersParams): Promise<number>;
	updateStatus(userId: string, status: UserStatus): Promise<UserEntity>;
}
