export const PLATFORMS = ["ANDROID", "IOS", "WEB"] as const;
export type PlatformType = (typeof PLATFORMS)[number];

export interface DeviceProps {
	id: string;
	userId: string;
	deviceId?: string | null;
	fid?: string | null;
	deviceName?: string | null;
	platform: PlatformType;
	appVersion?: string | null;
	isActive: boolean;
	lastLogin: Date;
	createdAt: Date;
	updatedAt: Date;
}

export class DeviceEntity {
	private readonly _props: DeviceProps;

	private constructor(props: DeviceProps) {
		this._props = props;
	}

	public static create(params: {
		id: string;
		userId: string;
		deviceId?: string | null;
		fid?: string | null;
		deviceName?: string | null;
		platform: PlatformType;
		appVersion?: string | null;
		isActive?: boolean;
	}): DeviceEntity {
		const now = new Date();
		return new DeviceEntity({
			id: params.id,
			userId: params.userId,
			deviceId: params.deviceId ?? null,
			fid: params.fid ?? null,
			deviceName: params.deviceName ?? null,
			platform: params.platform,
			appVersion: params.appVersion ?? null,
			isActive: params.isActive ?? true,
			lastLogin: now,
			createdAt: now,
			updatedAt: now,
		});
	}

	public static reconstitute(
		props: Omit<DeviceProps, "isActive" | "createdAt" | "updatedAt"> & {
			isActive?: boolean;
			createdAt?: Date;
			updatedAt?: Date;
		},
	): DeviceEntity {
		const now = new Date();
		return new DeviceEntity({
			id: props.id,
			userId: props.userId,
			deviceId: props.deviceId ?? null,
			fid: props.fid ?? null,
			deviceName: props.deviceName ?? null,
			platform: props.platform,
			appVersion: props.appVersion ?? null,
			isActive: props.isActive ?? true,
			lastLogin: props.lastLogin ?? now,
			createdAt: props.createdAt ?? props.lastLogin ?? now,
			updatedAt: props.updatedAt ?? props.lastLogin ?? now,
		});
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

	public get fid(): string | null | undefined {
		return this._props.fid;
	}

	public get deviceName(): string | null | undefined {
		return this._props.deviceName;
	}

	public get platform(): PlatformType {
		return this._props.platform;
	}

	public get appVersion(): string | null | undefined {
		return this._props.appVersion;
	}

	public get isActive(): boolean {
		return this._props.isActive;
	}

	public get lastLogin(): Date {
		return this._props.lastLogin;
	}

	public get createdAt(): Date {
		return this._props.createdAt;
	}

	public get updatedAt(): Date {
		return this._props.updatedAt;
	}

	public updateFid(fid: string | null): void {
		this._props.fid = fid;
		this._props.isActive = true;
		this._props.lastLogin = new Date();
		this._props.updatedAt = new Date();
	}

	public updateDeviceInfo(params: {
		fid?: string | null;
		deviceName?: string | null;
		platform?: PlatformType;
		appVersion?: string | null;
	}): void {
		if (params.fid !== undefined) {
			this._props.fid = params.fid;
		}
		if (params.deviceName !== undefined) {
			this._props.deviceName = params.deviceName;
		}
		if (params.platform !== undefined) {
			this._props.platform = params.platform;
		}
		if (params.appVersion !== undefined) {
			this._props.appVersion = params.appVersion;
		}
		this._props.isActive = true;
		this._props.lastLogin = new Date();
		this._props.updatedAt = new Date();
	}

	public deactivate(): void {
		this._props.isActive = false;
		this._props.updatedAt = new Date();
	}

	public activate(): void {
		this._props.isActive = true;
		this._props.updatedAt = new Date();
	}

	public updateLastLogin(date = new Date()): void {
		this._props.lastLogin = date;
		this._props.updatedAt = new Date();
	}
}
