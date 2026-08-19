import type { PlatformType } from "@domain/entities/device.entity.ts";

export interface LoginDeviceDto {
	deviceName?: string | null;
	platform?: PlatformType | null;
	fcmToken?: string | null;
}

export interface LoginDto {
	email: string;
	password: string;
	device?: LoginDeviceDto | null;
}

export interface LoginUserResponseDto {
	id: string;
	fullname: string;
	email: string;
	phone: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface LoginResultDto {
	user: LoginUserResponseDto;
	accessToken: string;
	refreshToken: string;
}
