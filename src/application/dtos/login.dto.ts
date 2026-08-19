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
	full_name: string;
	email: string;
	phone: string;
	status: string;
	created_at: string;
	updated_at: string;
}

export interface LoginResultDto {
	user: LoginUserResponseDto;
	access_token: string;
	refresh_token: string;
}
