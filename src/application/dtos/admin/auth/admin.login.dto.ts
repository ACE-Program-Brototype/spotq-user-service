export interface AdminLoginDTO {
	user: {
		_id: string;
		name: string;
		email: string;
		created_at: Date;
	};
	access_token: string;
	refresh_token: string;
}
