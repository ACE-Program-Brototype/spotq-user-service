/**
 * Data Transfer Object representing the customer's complete profile response.
 */
export interface CustomerProfileResponseDto {
	id: string;
	first_name: string;
	last_name: string | null;
	full_name: string;
	email: string;
	phone: string | null;
	status: string;
	avatar_url: string | null;
	gender: string | null;
	dob: string | null;
	location: string | null;
	default_address: null;
	created_at: string;
	updated_at: string;
}
