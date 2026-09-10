import { updateCustomerProfileSchema } from "@interfaces/http/validators/update-customer-profile.validator.ts";

describe("updateCustomerProfileSchema", () => {
	it("should accept valid update fields", () => {
		const validData = {
			full_name: "Rahul Sharma",
			dob: "1995-05-20",
			gender: "MALE",
		};

		const result = updateCustomerProfileSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it("should accept null values for nullable fields", () => {
		const validData = {
			dob: null,
			gender: null,
		};

		const result = updateCustomerProfileSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it("should reject invalid human name format", () => {
		const invalidData = {
			full_name: "John123",
		};

		const result = updateCustomerProfileSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	it("should reject future date of birth", () => {
		const invalidData = {
			dob: "2099-01-01",
		};

		const result = updateCustomerProfileSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	it("should reject unrecognized/disallowed keys", () => {
		const invalidData = {
			full_name: "Rahul Sharma",
			email: "newemail@example.com",
		};

		const result = updateCustomerProfileSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
	});
});
