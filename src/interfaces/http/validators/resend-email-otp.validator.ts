import { z } from "zod";

export const resendEmailOtpSchema = z.object({
	email: z
		.string({ message: "Email is required." })
		.trim()
		.email("Invalid email address format.")
		.max(254, "Email must not exceed 254 characters.")
		.toLowerCase(),
});

export type ResendEmailOtpInput = z.infer<typeof resendEmailOtpSchema>;
