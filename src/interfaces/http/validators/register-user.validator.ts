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
		.string({ message: "Full name is required." })
		.trim()
		.min(2, "Full name must be at least 2 characters.")
		.max(100, "Full name must not exceed 100 characters.")
		.refine(hasNoControlChars, {
			message: "Full name must not contain control characters.",
		})
		.refine((val) => /^[\p{L}\p{M}]+(?:[' -][\p{L}\p{M}]+)*$/u.test(val), {
			message:
				"Full name can only contain letters, spaces, hyphens, and apostrophes.",
		}),

	email: z
		.string({ message: "Email is required." })
		.trim()
		.email("Invalid email address format.")
		.max(254, "Email must not exceed 254 characters."),

	phoneNumber: z
		.string({ message: "Phone number is required." })
		.trim()
		.refine((val) => val.startsWith("+91"), {
			message: "Phone number must start with +91 (Indian numbers only).",
		})
		.refine((val) => /^\+91[6-9]\d{9}$/.test(val.replace(/[\s-]/g, "")), {
			message:
				"Invalid Indian mobile number format. Expected +91 followed by 10 digits.",
		}),

	password: z
		.string({ message: "Password is required." })
		.min(8, "Password must be at least 8 characters.")
		.max(128, "Password must not exceed 128 characters.")
		.refine((val) => val === val.trim(), {
			message: "Password must not contain leading or trailing whitespace.",
		})
		.refine((val) => /[A-Z]/.test(val), {
			message: "Password must contain at least one uppercase letter.",
		})
		.refine((val) => /[a-z]/.test(val), {
			message: "Password must contain at least one lowercase letter.",
		})
		.refine((val) => /[0-9]/.test(val), {
			message: "Password must contain at least one number.",
		})
		.refine((val) => /[^A-Za-z0-9]/.test(val), {
			message: "Password must contain at least one special character.",
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
