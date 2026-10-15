import { googleAuthSchema } from "@interfaces/http/validators/google-auth.validator.ts";

describe("googleAuthSchema", () => {
	it("should pass when valid inputs are provided", () => {
		const result = googleAuthSchema.safeParse({
			idToken: "some-long-google-id-token",
		});

		expect(result.success).toBe(true);
	});

	it("should fail when idToken is missing", () => {
		const result = googleAuthSchema.safeParse({});

		expect(result.success).toBe(false);
	});

	it("should fail when idToken is empty", () => {
		const result = googleAuthSchema.safeParse({
			idToken: "",
		});

		expect(result.success).toBe(false);
	});
});
