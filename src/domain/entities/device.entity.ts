export type PlatformType = "ANDROID" | "IOS" | "WEB";

export interface DeviceProps {
	id: string;
	userId: string;
	fcmToken?: string | null;
	deviceName?: string | null;
	platform: PlatformType;
	lastLogin: Date;
}

export class DeviceEntity {
	private readonly props: DeviceProps;

	private constructor(props: DeviceProps) {
		this.props = props;
	}

	public static create(params: {
		id: string;
		userId: string;
		fcmToken?: string | null;
		deviceName?: string | null;
		platform: PlatformType;
	}): DeviceEntity {
		return new DeviceEntity({
			id: params.id,
			userId: params.userId,
			fcmToken: params.fcmToken ?? null,
			deviceName: params.deviceName ?? null,
			platform: params.platform,
			lastLogin: new Date(),
		});
	}

	public static reconstitute(props: DeviceProps): DeviceEntity {
		return new DeviceEntity(props);
	}

	public get id(): string {
		return this.props.id;
	}

	public get userId(): string {
		return this.props.userId;
	}

	public get fcmToken(): string | null | undefined {
		return this.props.fcmToken;
	}

	public get deviceName(): string | null | undefined {
		return this.props.deviceName;
	}

	public get platform(): PlatformType {
		return this.props.platform;
	}

	public get lastLogin(): Date {
		return this.props.lastLogin;
	}

	public updateLastLogin(date = new Date()): void {
		this.props.lastLogin = date;
	}
}
