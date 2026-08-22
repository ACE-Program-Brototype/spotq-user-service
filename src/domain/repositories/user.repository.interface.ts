import type { DeviceEntity } from "../entities/device.entity.ts";
import type { RefreshTokenEntity } from "../entities/refresh-token.entity.ts";
import type { UserEntity } from "../entities/user.entity.ts";
import type { Email } from "../value-objects/email.vo.ts";
import type { PhoneNumber } from "../value-objects/phone-number.vo.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface CreateUserWithSessionParams {
	user: UserEntity;
	device?: DeviceEntity | null;
	refreshToken: RefreshTokenEntity;
}

export interface IUserRepository extends IBaseRepository<UserEntity> {
	findByEmail(email: Email | string): Promise<UserEntity | null>;
	findByPhone(phone: PhoneNumber | string): Promise<UserEntity | null>;
	createWithSession(params: CreateUserWithSessionParams): Promise<UserEntity>;
}
