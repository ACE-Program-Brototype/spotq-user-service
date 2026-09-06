import { VALIDATION_MESSAGES } from "@shared/constants/index.ts";
import { z } from "zod";

export const verifyEmailOtpSchema = z.object({
	email: z
		.string({ message: VALIDATION_MESSAGES.EMAIL.REQUIRED })
		.trim()
		.email(VALIDATION_MESSAGES.EMAIL.FORMAT)
		.max(254, VALIDATION_MESSAGES.EMAIL.MAX)
		.toLowerCase(),

	otp: z
		.string({ message: VALIDATION_MESSAGES.OTP.REQUIRED })
		.trim()
		.length(6, VALIDATION_MESSAGES.OTP.LENGTH)
		.regex(/^\d{6}$/, VALIDATION_MESSAGES.OTP.FORMAT),

	device: z
		.object({
			deviceName: z.string().max(100).optional(),
			platform: z.enum(["ANDROID", "IOS", "WEB"]).optional(),
			fcmToken: z.string().max(500).optional(),
		})
		.optional(),
});

export type VerifyEmailOtpInput = z.infer<typeof verifyEmailOtpSchema>;
