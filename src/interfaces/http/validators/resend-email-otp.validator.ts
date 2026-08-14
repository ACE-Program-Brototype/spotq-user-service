import { z } from "zod";

export const resendEmailOtpSchema = z.object({
	email: z
		.string({ required_error: "Email is required." })
		.trim()
		.email("Invalid email address format."),
});

export type ResendEmailOtpInput = z.infer<typeof resendEmailOtpSchema>;
