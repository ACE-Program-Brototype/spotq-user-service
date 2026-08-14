import { z } from "zod";

export const verifyEmailOtpSchema = z.object({
	email: z
		.string({ message: "Email is required." })
		.trim()
		.email("Invalid email address format.")
		.max(254, "Email must not exceed 254 characters."),

	otp: z
		.string({ message: "OTP is required." })
		.trim()
		.length(6, "OTP must be exactly 6 digits.")
		.regex(/^\d{6}$/, "OTP must contain numbers only."),
});

export type VerifyEmailOtpInput = z.infer<typeof verifyEmailOtpSchema>;
