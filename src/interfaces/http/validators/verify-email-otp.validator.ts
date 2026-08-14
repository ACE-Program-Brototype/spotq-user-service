import { z } from "zod";

export const verifyEmailOtpSchema = z.object({
	email: z
		.string({ required_error: "Email is required." })
		.trim()
		.email("Invalid email address format."),

	otp: z
		.string({ required_error: "OTP is required." })
		.trim()
		.regex(/^\d{6}$/, "OTP must be exactly 6 digits."),
});

export type VerifyEmailOtpInput = z.infer<typeof verifyEmailOtpSchema>;
