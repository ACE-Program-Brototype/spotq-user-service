import { REGEX } from "@shared/constants/regex.constants.ts";
import { VALIDATION_MESSAGES } from "@shared/constants/validation-messages.constants.ts";
import { z } from "zod";

/**
 * Zod validation schema for updating customer profile.
 * - Disallows extraneous / protected keys strictly.
 * - Validates full_name against allowed alphabet and punctuation patterns.
 * - Validates dob against ISO date format (YYYY-MM-DD) and ensures it is not a future date.
 * - Validates gender against allowed enum values.
 */
export const updateCustomerProfileSchema = z
	.object({
		full_name: z
			.string({
				invalid_type_error: VALIDATION_MESSAGES.PROFILE.FULL_NAME_STRING,
			})
			.trim()
			.min(2, VALIDATION_MESSAGES.PROFILE.FULL_NAME_MIN)
			.max(100, VALIDATION_MESSAGES.PROFILE.FULL_NAME_MAX)
			.regex(REGEX.NAME, VALIDATION_MESSAGES.PROFILE.FULL_NAME_REGEX)
			.optional(),

		dob: z
			.string({
				invalid_type_error: VALIDATION_MESSAGES.PROFILE.DOB_STRING,
			})
			.regex(REGEX.ISO_DATE_ONLY, VALIDATION_MESSAGES.PROFILE.DOB_FORMAT)
			.refine(
				(val) => {
					const parsed = new Date(val);
					if (Number.isNaN(parsed.getTime())) return false;
					const now = new Date();
					now.setHours(23, 59, 59, 999);
					return parsed <= now;
				},
				{
					message: VALIDATION_MESSAGES.PROFILE.DOB_NON_FUTURE,
				},
			)
			.nullable()
			.optional(),

		gender: z
			.enum(["MALE", "FEMALE", "OTHER"], {
				errorMap: () => ({
					message: VALIDATION_MESSAGES.PROFILE.GENDER_ENUM,
				}),
			})
			.nullable()
			.optional(),
	})
	.strict();

export type UpdateCustomerProfileSchema = z.infer<
	typeof updateCustomerProfileSchema
>;
