import { UserStatus } from "@domain/entities/user.entity.ts";
import { listCustomersQuerySchema } from "@interfaces/http/validators/admin/list-customers.validator.ts";
import { VALIDATION_MESSAGES } from "@shared/constants/validation-messages.constants.ts";

describe("listCustomersQuerySchema", () => {
	it("should parse valid empty query parameters", () => {
		const result = listCustomersQuerySchema.safeParse({});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({});
		}
	});

	it("should parse valid query with status, search, pagination, and sorting", () => {
		const result = listCustomersQuerySchema.safeParse({
			status: "ACTIVE",
			search: "john",
			page: "2",
			limit: "50",
			sortBy: "createdAt",
			sortOrder: "ASC",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				status: UserStatus.ACTIVE,
				search: "john",
				page: 2,
				limit: 50,
				sortBy: "createdAt",
				sortOrder: "ASC",
			});
		}
	});

	it("should reject invalid customer status", () => {
		const result = listCustomersQuerySchema.safeParse({
			status: "INVALID_STATUS",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.PAGINATION.INVALID_STATUS,
			);
		}
	});

	it("should reject negative or zero page", () => {
		const resultZero = listCustomersQuerySchema.safeParse({
			page: "0",
		});
		expect(resultZero.success).toBe(false);
		if (!resultZero.success) {
			expect(resultZero.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.PAGINATION.INVALID_PAGE,
			);
		}

		const resultNegative = listCustomersQuerySchema.safeParse({
			page: "-5",
		});
		expect(resultNegative.success).toBe(false);
	});

	it("should reject limit exceeding 100", () => {
		const result = listCustomersQuerySchema.safeParse({
			limit: "150",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.PAGINATION.INVALID_LIMIT,
			);
		}
	});

	it("should reject invalid sort field", () => {
		const result = listCustomersQuerySchema.safeParse({
			sortBy: "password",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.PAGINATION.INVALID_SORT_FIELD,
			);
		}
	});

	it("should reject invalid sort order", () => {
		const result = listCustomersQuerySchema.safeParse({
			sortOrder: "SIDEWAYS",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.PAGINATION.INVALID_SORT_ORDER,
			);
		}
	});
});
