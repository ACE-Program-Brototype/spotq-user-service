export interface GoogleAuthDto {
	idToken: string;
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
