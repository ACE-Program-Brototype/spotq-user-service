import { authConstants } from "@shared/constants/auth.constants";
import z from "zod";

export const passwordValidate = z.object({
	password: z.string().min(6, authConstants.PASSWORD_TOO_SHORT),
});
