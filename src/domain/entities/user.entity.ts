import { Email, FullName, PhoneNumber } from "../value-objects/index.ts";
import type { UserProfileEntity } from "./user-profile.entity.ts";

export enum UserStatus {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
	BLOCKED = "BLOCKED",
}

export interface UserEntityProps {
	id: string;
	fullName: FullName;
	phone: PhoneNumber | null;
	email: Email;
	passwordHash: string | null;
	googleId?: string | null;
	status: UserStatus;
	isEmailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
	profile?: UserProfileEntity | null;
}

export class UserEntity {
	private readonly _props: UserEntityProps;

	private constructor(props: UserEntityProps) {
		this._props = props;
	}

	public static create(params: {
		id: string;
		fullName: string | FullName;
		phone: string | PhoneNumber | null;
		email: string | Email;
		passwordHash: string | null;
		googleId?: string | null;
		isEmailVerified?: boolean;
		profile?: UserProfileEntity | null;
	}): UserEntity {
		const now = new Date();
		const fullNameVo =
			typeof params.fullName === "string"
				? FullName.create(params.fullName)
				: params.fullName;
		const phoneVo =
			params.phone === null
				? null
				: typeof params.phone === "string"
					? PhoneNumber.create(params.phone)
					: params.phone;
		const emailVo =
			typeof params.email === "string"
				? Email.create(params.email)
				: params.email;

		return new UserEntity({
			id: params.id,
			fullName: fullNameVo,
			phone: phoneVo,
			email: emailVo,
			passwordHash: params.passwordHash,
			googleId: params.googleId ?? null,
			status: UserStatus.ACTIVE,
			isEmailVerified: params.isEmailVerified ?? false,
			createdAt: now,
			updatedAt: now,
			profile: params.profile ?? null,
		});
	}

	public static reconstitute(props: UserEntityProps): UserEntity {
		return new UserEntity(props);
	}

	public get id(): string {
		return this._props.id;
	}

	public get fullName(): FullName {
		return this._props.fullName;
	}

	public get phone(): PhoneNumber | null {
		return this._props.phone;
	}

	public get email(): Email {
		return this._props.email;
	}

	public get passwordHash(): string | null {
		return this._props.passwordHash;
	}

	public get googleId(): string | null | undefined {
		return this._props.googleId;
	}

	public get status(): UserStatus {
		return this._props.status;
	}

	public get isEmailVerified(): boolean {
		return this._props.isEmailVerified;
	}

	public get createdAt(): Date {
		return this._props.createdAt;
	}

	public get updatedAt(): Date {
		return this._props.updatedAt;
	}

	public get profile(): UserProfileEntity | null | undefined {
		return this._props.profile;
	}

	public markEmailAsVerified(): void {
		this._props.isEmailVerified = true;
		this._props.updatedAt = new Date();
	}

	public linkGoogleAccount(googleId: string): void {
		this._props.googleId = googleId;
		this._props.isEmailVerified = true;
		this._props.updatedAt = new Date();
	}

	public changePassword(passwordHash: string): void {
		this._props.passwordHash = passwordHash;
		this._props.updatedAt = new Date();
	}
}
