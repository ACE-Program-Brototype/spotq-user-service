import {
	AdminCustomerDetailsMapper,
	toAdminCustomerDetailsResponse,
} from "@application/mappers/admin/admin-customer-details.mapper.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import { UserProfileEntity } from "@domain/entities/user-profile.entity.ts";
import { Email } from "@domain/value-objects/email.vo.ts";
import { FullName } from "@domain/value-objects/full-name.vo.ts";
import { PhoneNumber } from "@domain/value-objects/phone-number.vo.ts";

describe("AdminCustomerDetailsMapper", () => {
	const mockCreatedAt = new Date("2026-01-15T10:00:00.000Z");
	const mockUpdatedAt = new Date("2026-01-16T12:30:00.000Z");
	const mockDob = new Date("1995-05-20T00:00:00.000Z");

	it("should map UserEntity with UserProfile correctly to AdminCustomerDetailsResponseDto", () => {
		const profile = UserProfileEntity.reconstitute({
			id: "prof-123",
			userId: "user-123",
			dob: mockDob,
			gender: "Male",
			location: "New York, USA",
			createdAt: mockCreatedAt,
			updatedAt: mockUpdatedAt,
		});

		const user = UserEntity.reconstitute({
			id: "user-123",
			fullName: FullName.create("Jane Doe"),
			email: Email.create("jane.doe@example.com"),
			phone: PhoneNumber.create("+919876543210"),
			passwordHash: "hashed_password",
			status: UserStatus.ACTIVE,
			isEmailVerified: true,
			createdAt: mockCreatedAt,
			updatedAt: mockUpdatedAt,
			profile,
		});

		const response = AdminCustomerDetailsMapper.toResponse(user);

		expect(response).toEqual({
			id: "user-123",
			full_name: "Jane Doe",
			fullName: "Jane Doe",
			fullname: "Jane Doe",
			email: "jane.doe@example.com",
			phone: "+919876543210",
			status: "ACTIVE",
			is_email_verified: true,
			isEmailVerified: true,
			gender: "Male",
			dob: "1995-05-20",
			location: "New York, USA",
			avatar_url: null,
			avatarUrl: null,
			created_at: "2026-01-15T10:00:00.000Z",
			createdAt: "2026-01-15T10:00:00.000Z",
			updated_at: "2026-01-16T12:30:00.000Z",
			updatedAt: "2026-01-16T12:30:00.000Z",
		});
	});

	it("should handle null profile, phone, and undefined dob correctly", () => {
		const user = UserEntity.reconstitute({
			id: "user-456",
			fullName: FullName.create("John Smith"),
			email: Email.create("john.smith@example.com"),
			phone: null,
			passwordHash: null,
			status: UserStatus.INACTIVE,
			isEmailVerified: false,
			createdAt: mockCreatedAt,
			updatedAt: mockUpdatedAt,
			profile: null,
		});

		const response = toAdminCustomerDetailsResponse(user);

		expect(response).toEqual({
			id: "user-456",
			full_name: "John Smith",
			fullName: "John Smith",
			fullname: "John Smith",
			email: "john.smith@example.com",
			phone: null,
			status: "INACTIVE",
			is_email_verified: false,
			isEmailVerified: false,
			gender: null,
			dob: null,
			location: null,
			avatar_url: null,
			avatarUrl: null,
			created_at: "2026-01-15T10:00:00.000Z",
			createdAt: "2026-01-15T10:00:00.000Z",
			updated_at: "2026-01-16T12:30:00.000Z",
			updatedAt: "2026-01-16T12:30:00.000Z",
		});
	});
});
