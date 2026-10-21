import { VALIDATION_MESSAGES } from "@shared/constants/index.ts";
import { z } from "zod";

export const googleAuthSchema = z.object({
	idToken: z
		.string({ message: VALIDATION_MESSAGES.GOOGLE.ID_TOKEN_REQUIRED })
		.min(1, {
			message: VALIDATION_MESSAGES.GOOGLE.ID_TOKEN_REQUIRED,
		}),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
