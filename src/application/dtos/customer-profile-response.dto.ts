/**
 * Data Transfer Object representing the customer's complete profile response.
 */
export interface CustomerProfileResponseDto {
	id: string;
	full_name: string;
	email: string;
	phone: string | null;
	status: string;
	gender: string | null;
	dob: string | null;
	created_at: string;
	updated_at: string;
}
