import type { DeviceEntity } from "../entities/device.entity.ts";
import type { RefreshTokenEntity } from "../entities/refresh-token.entity.ts";
import type { UserEntity } from "../entities/user.entity.ts";
import type { Email } from "../value-objects/email.vo.ts";
import type { PhoneNumber } from "../value-objects/phone-number.vo.ts";

export interface CreateUserWithSessionParams {
	user: UserEntity;
	device?: DeviceEntity | null;
	refreshToken: RefreshTokenEntity;
}

export interface IUserRepository {
	findByEmail(email: Email): Promise<UserEntity | null>;
	findByPhone(phone: PhoneNumber): Promise<UserEntity | null>;
	findById(id: string): Promise<UserEntity | null>;
	createWithSession(params: CreateUserWithSessionParams): Promise<UserEntity>;
}
