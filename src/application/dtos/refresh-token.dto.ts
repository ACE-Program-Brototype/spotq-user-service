export interface RefreshTokenDto {
	refreshToken: string;
}

export interface RefreshTokenResultDto {
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		email: string;
		fullName: string;
		status: string;
	};
}
