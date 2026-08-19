import { VALIDATION_MESSAGES } from "@shared/constants/index.ts";
import { z } from "zod";

export const logoutSchema = z.object({
	refreshToken: z
		.string({ message: VALIDATION_MESSAGES.REFRESH_TOKEN.REQUIRED })
		.min(1, VALIDATION_MESSAGES.REFRESH_TOKEN.EMPTY),
});

export type LogoutInput = z.infer<typeof logoutSchema>;
