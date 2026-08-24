import { VALIDATION_MESSAGES } from "@shared/constants/index.ts";
import { z } from "zod";

export const googleAuthSchema = z.object({
	idToken: z
		.string({ message: VALIDATION_MESSAGES.GOOGLE.ID_TOKEN_REQUIRED })
		.min(1, {
			message: VALIDATION_MESSAGES.GOOGLE.ID_TOKEN_REQUIRED,
		}),
	device: z
		.object({
			deviceName: z.string().optional().nullable(),
			platform: z.enum(["ANDROID", "IOS", "WEB"]).optional().nullable(),
			fcmToken: z.string().optional().nullable(),
		})
		.optional()
		.nullable(),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
