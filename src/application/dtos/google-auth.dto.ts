import type { PlatformType } from "@domain/entities/device.entity.ts";

export interface GoogleAuthDto {
	idToken: string;
	device?: {
		deviceName?: string | null;
		platform?: PlatformType | null;
		fcmToken?: string | null;
	} | null;
}

export interface GoogleAuthResultDto {
	user: {
		id: string;
		fullName: string;
		email: string;
		status: string;
	};
	accessToken: string;
	refreshToken: string;
}
