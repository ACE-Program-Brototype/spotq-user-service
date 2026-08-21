import { authConstants } from "@shared/constants/auth.constants";
import z from "zod";

export const passwordValidate = z.object({
	password: z
		.string()
		.min(8, authConstants.PASSWORD_TOO_SHORT)
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one number")
		.regex(
			/[^A-Za-z0-9]/,
			"Password must contain at least one special character",
		),
});
