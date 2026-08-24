export interface UserProfileProps {
	id: string;
	userId: string;
	avatarUrl?: string | null;
	dob?: Date | null;
	gender?: string | null;
	location?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export class UserProfileEntity {
	private readonly props: UserProfileProps;

	private constructor(props: UserProfileProps) {
		this.props = props;
	}

	public static create(params: {
		id: string;
		userId: string;
		avatarUrl?: string | null;
		dob?: Date | null;
		gender?: string | null;
		location?: string | null;
	}): UserProfileEntity {
		const now = new Date();
		return new UserProfileEntity({
			id: params.id,
			userId: params.userId,
			avatarUrl: params.avatarUrl ?? null,
			dob: params.dob ?? null,
			gender: params.gender ?? null,
			location: params.location ?? null,
			createdAt: now,
			updatedAt: now,
		});
	}

	public static reconstitute(props: UserProfileProps): UserProfileEntity {
		return new UserProfileEntity(props);
	}

	public get id(): string {
		return this.props.id;
	}

	public get userId(): string {
		return this.props.userId;
	}

	public get avatarUrl(): string | null | undefined {
		return this.props.avatarUrl;
	}

	public get dob(): Date | null | undefined {
		return this.props.dob;
	}

	public get gender(): string | null | undefined {
		return this.props.gender;
	}

	public get location(): string | null | undefined {
		return this.props.location;
	}

	public get createdAt(): Date {
		return this.props.createdAt;
	}

	public get updatedAt(): Date {
		return this.props.updatedAt;
	}
}
