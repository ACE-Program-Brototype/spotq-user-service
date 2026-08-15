import z from "zod";
import { loginConstants } from "@shared/constants/auth.constants.ts";

export const loginValidator = z.object({
  email: z.string().email({ message: loginConstants.INVALID_EMAIL }),
  password: z.string().min(6, { message: loginConstants.INVALID_PASSWORD }),
});