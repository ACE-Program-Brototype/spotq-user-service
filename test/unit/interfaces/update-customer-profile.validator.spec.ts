import { updateCustomerProfileSchema } from "@interfaces/http/validators/update-customer-profile.validator.ts";
import { VALIDATION_MESSAGES } from "@shared/constants/validation-messages.constants.ts";

describe("updateCustomerProfileSchema", () => {
	it("should validate a complete valid profile update payload", () => {
		const payload = {
			first_name: "Rahul",
			last_name: "Sharma",
			gender: "MALE",
			dob: "1995-06-20",
			location: "Kochi, Kerala",
			avatar_url: "https://cdn.spotq.com/avatars/user-123.jpg",
		};

		const result = updateCustomerProfileSchema.safeParse(payload);
		expect(result.success).toBe(true);
	});

	it("should validate partial payloads with null values for optional fields", () => {
		const payload = {
			first_name: "Rahul",
			last_name: null,
			gender: null,
			dob: null,
			location: null,
			avatar_url: null,
		};

		const result = updateCustomerProfileSchema.safeParse(payload);
		expect(result.success).toBe(true);
	});

	it("should reject empty first name", () => {
		const payload = {
			first_name: "",
		};

		const result = updateCustomerProfileSchema.safeParse(payload);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.PROFILE.FIRST_NAME_REQUIRED,
			);
		}
	});

	it("should reject invalid gender value", () => {
		const payload = {
			gender: "INVALID_GENDER",
		};

		const result = updateCustomerProfileSchema.safeParse(payload);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.PROFILE.GENDER_INVALID,
			);
		}
	});

	it("should reject invalid date of birth format", () => {
		const payload = {
			dob: "20-05-1995",
		};

		const result = updateCustomerProfileSchema.safeParse(payload);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.PROFILE.DOB_INVALID_FORMAT,
			);
		}
	});

	it("should reject future date of birth", () => {
		const payload = {
			dob: "2099-01-01",
		};

		const result = updateCustomerProfileSchema.safeParse(payload);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.PROFILE.DOB_FUTURE,
			);
		}
	});

	it("should reject invalid avatar URL", () => {
		const payload = {
			avatar_url: "not-a-valid-url",
		};

		const result = updateCustomerProfileSchema.safeParse(payload);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.PROFILE.AVATAR_URL_INVALID,
			);
		}
	});

	it("should reject protected/unrecognized fields like role and email", () => {
		const payload = {
			first_name: "Rahul",
			role: "ADMIN",
			email: "hacked@example.com",
		};

		const result = updateCustomerProfileSchema.safeParse(payload);
		expect(result.success).toBe(false);
	});
});
