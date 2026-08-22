import { authConstants } from "@shared/constants/auth.constants";
import z from "zod";

export const loginValidator = z.object({
	email: z.string().email({ message: authConstants.INVALID_EMAIL }),
	password: z.string().min(6, { message: authConstants.PASSWORD_TOO_SHORT }),
});
