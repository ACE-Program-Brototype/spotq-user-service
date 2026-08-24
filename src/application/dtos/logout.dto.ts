export interface LogoutDto {
	userId: string;
	refreshToken?: string;
}

export interface LogoutResultDto {
	success: boolean;
	message: string;
}
