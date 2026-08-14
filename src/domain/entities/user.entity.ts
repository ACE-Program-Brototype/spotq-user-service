import type { Email, FullName, PhoneNumber } from "../value-objects/index.ts";

export type UserStatus = "ACTIVE";

export interface UserEntityProps {
	id: string;
	fullName: FullName;
	phone: PhoneNumber;
	email: Email;
	passwordHash: string;
	googleId?: string | null;
	status: UserStatus;
	createdAt: Date;
	updatedAt: Date;
}

export class UserEntity {
	private readonly props: UserEntityProps;

	private constructor(props: UserEntityProps) {
		this.props = props;
	}

	public static create(params: {
		id: string;
		fullName: FullName;
		phone: PhoneNumber;
		email: Email;
		passwordHash: string;
		googleId?: string | null;
	}): UserEntity {
		const now = new Date();
		return new UserEntity({
			id: params.id,
			fullName: params.fullName,
			phone: params.phone,
			email: params.email,
			passwordHash: params.passwordHash,
			googleId: params.googleId ?? null,
			status: "ACTIVE",
			createdAt: now,
			updatedAt: now,
		});
	}

	public static reconstitute(props: UserEntityProps): UserEntity {
		return new UserEntity(props);
	}

	public get id(): string {
		return this.props.id;
	}

	public get fullName(): FullName {
		return this.props.fullName;
	}

	public get phone(): PhoneNumber {
		return this.props.phone;
	}

	public get email(): Email {
		return this.props.email;
	}

	public get passwordHash(): string {
		return this.props.passwordHash;
	}

	public get googleId(): string | null | undefined {
		return this.props.googleId;
	}

	public get status(): UserStatus {
		return this.props.status;
	}

	public get createdAt(): Date {
		return this.props.createdAt;
	}

	public get updatedAt(): Date {
		return this.props.updatedAt;
	}
}
