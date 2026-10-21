export interface VerifyEmailOtpDto {
	email: string;
	otp: string;
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
