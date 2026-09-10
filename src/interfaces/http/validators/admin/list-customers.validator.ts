import { VALIDATION_MESSAGES } from "@shared/constants/validation-messages.constants.ts";
import { z } from "zod";

export const listCustomersQuerySchema = z.object({
	status: z
		.enum(["ACTIVE", "INACTIVE", "BLOCKED"], {
			message: VALIDATION_MESSAGES.PAGINATION.INVALID_STATUS,
		})
		.optional(),
	search: z.string().optional(),
	page: z.preprocess(
		(val) => (val !== undefined && val !== "" ? Number(val) : undefined),
		z
			.number({
				invalid_type_error: VALIDATION_MESSAGES.PAGINATION.INVALID_PAGE,
			})
			.int({ message: VALIDATION_MESSAGES.PAGINATION.INVALID_PAGE })
			.positive({ message: VALIDATION_MESSAGES.PAGINATION.INVALID_PAGE })
			.optional(),
	),
	limit: z.preprocess(
		(val) => (val !== undefined && val !== "" ? Number(val) : undefined),
		z
			.number({
				invalid_type_error: VALIDATION_MESSAGES.PAGINATION.INVALID_LIMIT,
			})
			.int({ message: VALIDATION_MESSAGES.PAGINATION.INVALID_LIMIT })
			.positive({ message: VALIDATION_MESSAGES.PAGINATION.INVALID_LIMIT })
			.max(100, { message: VALIDATION_MESSAGES.PAGINATION.INVALID_LIMIT })
			.optional(),
	),
	sortBy: z
		.enum(["createdAt"], {
			message: VALIDATION_MESSAGES.PAGINATION.INVALID_SORT_FIELD,
		})
		.optional(),
	sortOrder: z
		.enum(["ASC", "DESC", "asc", "desc"], {
			message: VALIDATION_MESSAGES.PAGINATION.INVALID_SORT_ORDER,
		})
		.optional(),
});

export type ListCustomersQuerySchema = z.infer<typeof listCustomersQuerySchema>;
