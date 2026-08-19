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

	device: z
		.object({
			deviceName: z.string().max(100).optional(),
			platform: z.enum(["ANDROID", "IOS", "WEB"]).optional(),
			fcmToken: z.string().max(500).optional(),
		})
		.optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
