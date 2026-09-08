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

	it("should reject calendar rollover dates like February 31st or April 31st", () => {
		const invalidDates = ["2024-02-31", "2023-04-31", "2023-02-29"];

		for (const dob of invalidDates) {
			const result = updateCustomerProfileSchema.safeParse({ dob });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe(
					VALIDATION_MESSAGES.PROFILE.DOB_FUTURE,
				);
			}
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
