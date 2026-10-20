import type { PlatformType } from "@domain/entities/device.entity.ts";

export interface RegisterCustomerDeviceDto {
	userId: string;
	deviceId: string;
	fid?: string | null;
	platform: PlatformType;
	appVersion?: string | null;
	deviceName?: string | null;
}

export interface RegisterDeviceResultDto {
	deviceId: string;
	platform: PlatformType;
	isActive: boolean;
	deviceName?: string | null;
	appVersion?: string | null;
}

export interface CustomerDeviceResponseDto {
	device_registration_id: string;
	device_id: string | null;
	platform: PlatformType;
	device_name: string | null;
	app_version: string | null;
	is_active: boolean;
	last_login: Date;
	created_at: Date;
	updated_at: Date;
}

export interface DeactivateDeviceDto {
	userId: string;
	deviceId?: string;
	fid?: string;
}
