import { loginConstants } from "@shared/constants/auth.constants.ts";
import z from "zod";

export const loginValidator = z.object({
	email: z.string().email({ message: loginConstants.INVALID_EMAIL }),
	password: z.string().min(6, { message: loginConstants.PASSWORD_TOO_SHORT }),
});
