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

export interface RegisteredUserResponseDto {
	id: string;
	fullName: string;
	email: string;
	phoneNumber: string;
	status: string;
	createdAt: string;
}

export interface RegisterUserResultDto {
	user: RegisteredUserResponseDto;
	accessToken: string;
	refreshToken: string;
}
