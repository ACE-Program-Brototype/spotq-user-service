/**
 * Data Transfer Object for updating a customer's personal profile information.
 */
export interface UpdateCustomerProfileDto {
	full_name?: string;
	gender?: "MALE" | "FEMALE" | "OTHER" | null;
	dob?: string | null;
	location?: string | null;
}
