import type { PlatformType } from "@domain/entities/device.entity.ts";

export interface VerifyDeviceDto {
	deviceName?: string;
	platform?: PlatformType;
	fcmToken?: string;
}

export interface VerifyEmailOtpDto {
	email: string;
	otp: string;
	device?: VerifyDeviceDto;
}

export interface VerifiedUserResponseDto {
	id: string;
	fullName: string;
	email: string;
	phoneNumber: string;
	status: string;
	createdAt: string;
}

export interface VerifyEmailOtpResultDto {
	user: VerifiedUserResponseDto;
	accessToken: string;
	refreshToken: string;
}
