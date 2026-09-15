import { VALIDATION_MESSAGES } from "@shared/constants/validation-messages.constants.ts";
import { z } from "zod";

export const updateCustomerStatusSchema = z.object({
	status: z.enum(["ACTIVE", "BLOCKED"], {
		error: (issue) => {
			if (issue.input === undefined) {
				return VALIDATION_MESSAGES.STATUS.STATUS_REQUIRED;
			}
			return VALIDATION_MESSAGES.STATUS.INVALID_STATUS;
		},
	}),
});

export const updateCustomerStatusParamsSchema = z.object({
	userId: z
		.string({
			error: () => VALIDATION_MESSAGES.STATUS.INVALID_USER_ID,
		})
		.uuid({ message: VALIDATION_MESSAGES.STATUS.INVALID_USER_ID }),
});

export type UpdateCustomerStatusSchema = z.infer<
	typeof updateCustomerStatusSchema
>;
export type UpdateCustomerStatusParamsSchema = z.infer<
	typeof updateCustomerStatusParamsSchema
>;
