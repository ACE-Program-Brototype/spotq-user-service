export interface VerifyEmailOtpDto {
	email: string;
	otp: string;
}

export interface VerifyEmailOtpResultDto {
	success: boolean;
	message: string;
}
