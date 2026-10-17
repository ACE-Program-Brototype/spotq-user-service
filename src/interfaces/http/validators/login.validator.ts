import { VALIDATION_MESSAGES } from "@shared/constants/index.ts";
import { z } from "zod";

export const loginSchema = z.object({
	email: z
		.string({ message: VALIDATION_MESSAGES.EMAIL.REQUIRED })
		.trim()
		.email(VALIDATION_MESSAGES.EMAIL.FORMAT)
		.max(254, VALIDATION_MESSAGES.EMAIL.MAX)
		.toLowerCase(),

	password: z
		.string({ message: VALIDATION_MESSAGES.PASSWORD.REQUIRED })
		.min(1, { message: VALIDATION_MESSAGES.PASSWORD.REQUIRED }),
});

export type LoginInput = z.infer<typeof loginSchema>;
