import type { PlatformType } from "@domain/entities/device.entity.ts";

export interface RegisterDeviceDto {
	deviceName?: string;
	platform?: PlatformType;
	fcmToken?: string;
}

export interface RegisterUserDto {
	fullName: string;
	email: string;
	phoneNumber: string;
	password: string;
	device?: RegisterDeviceDto;
}
