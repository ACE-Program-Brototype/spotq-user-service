import { googleAuthSchema } from "@interfaces/http/validators/google-auth.validator.ts";

describe("googleAuthSchema", () => {
	it("should pass when valid inputs are provided", () => {
		const result = googleAuthSchema.safeParse({
			idToken: "some-long-google-id-token",
			device: {
				deviceName: "My Mobile Device",
				platform: "ANDROID",
				fcmToken: "fcm-12345",
			},
		});

		expect(result.success).toBe(true);
	});

	it("should pass without optional device object", () => {
		const result = googleAuthSchema.safeParse({
			idToken: "some-long-google-id-token",
		});

		expect(result.success).toBe(true);
	});

	it("should fail when idToken is missing", () => {
		const result = googleAuthSchema.safeParse({
			device: {
				deviceName: "My Mobile Device",
				platform: "ANDROID",
			},
		});

		expect(result.success).toBe(false);
	});

	it("should fail when platform is invalid", () => {
		const result = googleAuthSchema.safeParse({
			idToken: "some-long-google-id-token",
			device: {
				platform: "WINDOWS",
			},
		});

		expect(result.success).toBe(false);
	});
});
