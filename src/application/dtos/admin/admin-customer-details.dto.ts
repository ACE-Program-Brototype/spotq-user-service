export interface AdminCustomerDetailsResponseDto {
	id: string;
	fullName: string;
	email: string;
	phone: string | null;
	status: string;
	isEmailVerified: boolean;
	avatarUrl: string | null;
	createdAt: string;
	updatedAt: string;
	location: string | null;
}
