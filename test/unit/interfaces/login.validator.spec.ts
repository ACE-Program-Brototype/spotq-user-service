import { loginSchema } from "@interfaces/http/validators/login.validator.ts";

describe("loginSchema", () => {
	it("should pass when valid inputs are provided", () => {
		const result = loginSchema.safeParse({
			email: "jane.doe@example.com",
			password: "Password@123",
		});

		expect(result.success).toBe(true);
	});

	it("should fail when email is missing", () => {
		const result = loginSchema.safeParse({
			password: "Password@123",
		});

		expect(result.success).toBe(false);
	});

	it("should fail when email has invalid format", () => {
		const result = loginSchema.safeParse({
			email: "invalid-email",
			password: "Password@123",
		});

		expect(result.success).toBe(false);
	});

	it("should fail when password is empty", () => {
		const result = loginSchema.safeParse({
			email: "jane.doe@example.com",
			password: "",
		});

		expect(result.success).toBe(false);
	});
});
