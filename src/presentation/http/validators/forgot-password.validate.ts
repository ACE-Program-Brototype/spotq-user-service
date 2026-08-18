import { authConstants } from "@shared/constants/auth.constants";
import z from "zod";

export const forgotPasswordValidate = z.object({
    email: z.string().email({ message: authConstants.INVALID_EMAIL })
});


export const forgotPasswordVerifyValidate = z.object({
    email: z.string().email({message: authConstants.INVALID_EMAIL}),
    otp: z.string().min(6).max(6)
})