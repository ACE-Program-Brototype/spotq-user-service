import { VALIDATION_MESSAGES } from "@shared/constants/index.ts";
import { z } from "zod";

function hasNoControlChars(str: string): boolean {
	for (let i = 0; i < str.length; i++) {
		const code = str.charCodeAt(i);
		if ((code >= 0 && code <= 31) || (code >= 127 && code <= 159)) {
			return false;
		}
	}
	return true;
}

export const registerUserSchema = z.object({
	fullName: z
		.string({ message: VALIDATION_MESSAGES.FULL_NAME.REQUIRED })
		.trim()
		.min(2, VALIDATION_MESSAGES.FULL_NAME.MIN)
		.max(100, VALIDATION_MESSAGES.FULL_NAME.MAX)
		.refine(hasNoControlChars, {
			message: VALIDATION_MESSAGES.FULL_NAME.CONTROL_CHARS,
		})
		.refine((val) => /^[\p{L}\p{M}]+(?:[' -][\p{L}\p{M}]+)*$/u.test(val), {
			message: VALIDATION_MESSAGES.FULL_NAME.FORMAT,
		}),

	email: z
		.string({ message: VALIDATION_MESSAGES.EMAIL.REQUIRED })
		.trim()
		.email(VALIDATION_MESSAGES.EMAIL.FORMAT)
		.max(254, VALIDATION_MESSAGES.EMAIL.MAX)
		.toLowerCase(),

	phoneNumber: z
		.string({ message: VALIDATION_MESSAGES.PHONE.REQUIRED })
		.trim()
		.refine((val) => val.startsWith("+91"), {
			message: VALIDATION_MESSAGES.PHONE.REGION,
		})
		.refine((val) => /^\+91[6-9]\d{9}$/.test(val.replace(/[\s-]/g, "")), {
			message: VALIDATION_MESSAGES.PHONE.FORMAT,
		})
		.transform((val) => `+91${val.slice(3).replace(/[\s-]/g, "")}`),

	password: z
		.string({ message: VALIDATION_MESSAGES.PASSWORD.REQUIRED })
		.min(8, VALIDATION_MESSAGES.PASSWORD.MIN)
		.max(128, VALIDATION_MESSAGES.PASSWORD.MAX)
		.refine((val) => val === val.trim(), {
			message: VALIDATION_MESSAGES.PASSWORD.WHITESPACE,
		})
		.refine((val) => /[A-Z]/.test(val), {
			message: VALIDATION_MESSAGES.PASSWORD.UPPERCASE,
		})
		.refine((val) => /[a-z]/.test(val), {
			message: VALIDATION_MESSAGES.PASSWORD.LOWERCASE,
		})
		.refine((val) => /[0-9]/.test(val), {
			message: VALIDATION_MESSAGES.PASSWORD.NUMBER,
		})
		.refine((val) => /[^A-Za-z0-9]/.test(val), {
			message: VALIDATION_MESSAGES.PASSWORD.SPECIAL_CHAR,
		}),

	device: z
		.object({
			deviceName: z.string().max(100).optional(),
			platform: z.enum(["ANDROID", "IOS", "WEB"]).optional(),
			fcmToken: z.string().max(500).optional(),
		})
		.optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
