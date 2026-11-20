/**
 * Data Transfer Object for updating customer profile.
 */
export interface UpdateCustomerProfileDto {
	full_name?: string;
	gender?: "MALE" | "FEMALE" | "OTHER" | null;
	dob?: string | null;
}
