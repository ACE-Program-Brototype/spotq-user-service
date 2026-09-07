import { VALIDATION_MESSAGES } from "@shared/constants/index.ts";
import { z } from "zod";

const nameRegex = /^[\p{L}\p{M}]+(?:[' -][\p{L}\p{M}]+)*$/u;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validation schema for updating customer profile information.
 */
export const updateCustomerProfileSchema = z
	.object({
		first_name: z
			.string()
			.trim()
			.min(1, { message: VALIDATION_MESSAGES.PROFILE.FIRST_NAME_REQUIRED })
			.max(50)
			.refine((val) => nameRegex.test(val), {
				message: VALIDATION_MESSAGES.PROFILE.FIRST_NAME_INVALID,
			})
			.optional(),

		last_name: z
			.string()
			.trim()
			.max(50)
			.refine((val) => val === "" || nameRegex.test(val), {
				message: VALIDATION_MESSAGES.PROFILE.LAST_NAME_INVALID,
			})
			.nullable()
			.optional(),

		gender: z
			.enum(["MALE", "FEMALE", "OTHER"], {
				message: VALIDATION_MESSAGES.PROFILE.GENDER_INVALID,
			})
			.nullable()
			.optional(),

		dob: z
			.string()
			.regex(isoDateRegex, {
				message: VALIDATION_MESSAGES.PROFILE.DOB_INVALID_FORMAT,
			})
			.refine(
				(val) => {
					const parsed = new Date(val);
					if (Number.isNaN(parsed.getTime())) {
						return false;
					}
					const today = new Date();
					today.setHours(23, 59, 59, 999);
					return parsed <= today;
				},
				{
					message: VALIDATION_MESSAGES.PROFILE.DOB_FUTURE,
				},
			)
			.nullable()
			.optional(),

		location: z
			.string()
			.trim()
			.max(100, { message: VALIDATION_MESSAGES.PROFILE.LOCATION_TOO_LONG })
			.nullable()
			.optional(),

		avatar_url: z
			.string()
			.url({ message: VALIDATION_MESSAGES.PROFILE.AVATAR_URL_INVALID })
			.nullable()
			.optional(),
	})
	.strict();

export type UpdateCustomerProfileInput = z.infer<
	typeof updateCustomerProfileSchema
>;
