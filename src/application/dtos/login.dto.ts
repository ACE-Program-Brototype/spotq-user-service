export interface LoginDto {
	email: string;
	password: string;
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
