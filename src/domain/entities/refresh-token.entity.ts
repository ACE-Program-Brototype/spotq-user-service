export interface RefreshTokenProps {
	id: string;
	userId: string;
	deviceId?: string | null;
	tokenHash: string;
	expiresAt: Date;
	createdAt: Date;
	revokedAt?: Date | null;
}

export class RefreshTokenEntity {
	private readonly _props: RefreshTokenProps;

	private constructor(props: RefreshTokenProps) {
		this._props = props;
	}

	public static create(params: {
		id: string;
		userId: string;
		deviceId?: string | null;
		tokenHash: string;
		expiresAt: Date;
	}): RefreshTokenEntity {
		return new RefreshTokenEntity({
			id: params.id,
			userId: params.userId,
			deviceId: params.deviceId ?? null,
			tokenHash: params.tokenHash,
			expiresAt: params.expiresAt,
			createdAt: new Date(),
			revokedAt: null,
		});
	}

	public static reconstitute(props: RefreshTokenProps): RefreshTokenEntity {
		return new RefreshTokenEntity(props);
	}

	public get id(): string {
		return this._props.id;
	}

	public get userId(): string {
		return this._props.userId;
	}

	public get deviceId(): string | null | undefined {
		return this._props.deviceId;
	}

	public get tokenHash(): string {
		return this._props.tokenHash;
	}

	public get expiresAt(): Date {
		return this._props.expiresAt;
	}

	public get createdAt(): Date {
		return this._props.createdAt;
	}

	public get revokedAt(): Date | null | undefined {
		return this._props.revokedAt;
	}

	public isRevoked(): boolean {
		return (
			this._props.revokedAt !== null && this._props.revokedAt !== undefined
		);
	}

	public isExpired(): boolean {
		return new Date() > this._props.expiresAt;
	}

	public isValid(): boolean {
		return !this.isRevoked() && !this.isExpired();
	}

	public revoke(revocationTime = new Date()): void {
		this._props.revokedAt = revocationTime;
	}
}
