import { registerUserSchema } from "@interfaces/http/validators/register-user.validator.ts";

describe("registerUserSchema", () => {
	it("should validate a valid registration payload", () => {
		const validPayload = {
			fullName: "John Doe",
			email: "john.doe@example.com",
			phoneNumber: "+919876543210",
			password: "Password@123",
			device: {
				deviceName: "iPhone 15",
				platform: "IOS",
				fcmToken: "sample-fcm-token",
			},
		};

		const result = registerUserSchema.safeParse(validPayload);
		expect(result.success).toBe(true);
	});

	it("should reject invalid email", () => {
		const result = registerUserSchema.safeParse({
			fullName: "John Doe",
			email: "invalid-email",
			phoneNumber: "+919876543210",
			password: "Password@123",
		});

		expect(result.success).toBe(false);
	});

	it("should reject non-Indian phone number", () => {
		const result = registerUserSchema.safeParse({
			fullName: "John Doe",
			email: "john@example.com",
			phoneNumber: "+12345678901",
			password: "Password@123",
		});

		expect(result.success).toBe(false);
	});

	it("should reject weak password without numbers or special characters", () => {
		const result = registerUserSchema.safeParse({
			fullName: "John Doe",
			email: "john@example.com",
			phoneNumber: "+919876543210",
			password: "password",
		});

		expect(result.success).toBe(false);
	});
});
