import {
	updateCustomerStatusParamsSchema,
	updateCustomerStatusSchema,
} from "@interfaces/http/validators/admin/update-customer-status.validator.ts";
import { VALIDATION_MESSAGES } from "@shared/constants/validation-messages.constants.ts";

describe("updateCustomerStatusSchema", () => {
	it("should parse valid ACTIVE status", () => {
		const result = updateCustomerStatusSchema.safeParse({
			status: "ACTIVE",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe("ACTIVE");
		}
	});

	it("should parse valid BLOCKED status", () => {
		const result = updateCustomerStatusSchema.safeParse({
			status: "BLOCKED",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe("BLOCKED");
		}
	});

	it("should reject invalid customer status", () => {
		const result = updateCustomerStatusSchema.safeParse({
			status: "SUSPENDED",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.STATUS.INVALID_STATUS,
			);
		}
	});

	it("should reject missing status with STATUS_REQUIRED message", () => {
		const result = updateCustomerStatusSchema.safeParse({});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.STATUS.STATUS_REQUIRED,
			);
		}
	});
});

describe("updateCustomerStatusParamsSchema", () => {
	it("should parse valid UUID userId", () => {
		const result = updateCustomerStatusParamsSchema.safeParse({
			userId: "123e4567-e89b-12d3-a456-426614174000",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.userId).toBe("123e4567-e89b-12d3-a456-426614174000");
		}
	});

	it("should reject invalid UUID userId", () => {
		const result = updateCustomerStatusParamsSchema.safeParse({
			userId: "invalid-uuid",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.STATUS.INVALID_USER_ID,
			);
		}
	});
});
