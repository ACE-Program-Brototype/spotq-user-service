export interface LogoutDto {
	userId: string;
	refreshToken?: string;
	deviceId?: string;
}

export interface LogoutResultDto {
	success: boolean;
	message: string;
}
