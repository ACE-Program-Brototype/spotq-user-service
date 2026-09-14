/**
 * Data Transfer Object representing the customer details response for platform admins.
 */
export interface AdminCustomerDetailsResponseDto {
	id: string;
	fullname: string;
	email: string;
	status: string;

	// TODO: Customer order details will be integrated from Order Service in the future.
}
