import { VALIDATION_MESSAGES } from "@shared/constants/index.ts";
import { z } from "zod";

export const resendEmailOtpSchema = z.object({
	email: z
		.string({ message: VALIDATION_MESSAGES.EMAIL.REQUIRED })
		.trim()
		.email(VALIDATION_MESSAGES.EMAIL.FORMAT)
		.max(254, VALIDATION_MESSAGES.EMAIL.MAX)
		.toLowerCase(),
});

export type ResendEmailOtpInput = z.infer<typeof resendEmailOtpSchema>;
