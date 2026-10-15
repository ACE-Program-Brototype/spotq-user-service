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
	deviceRegistrationId: string;
	deviceId: string | null;
	platform: PlatformType;
	deviceName: string | null;
	appVersion: string | null;
	isActive: boolean;
	lastLogin: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface DeactivateDeviceDto {
	userId: string;
	deviceId?: string;
	fid?: string;
}
