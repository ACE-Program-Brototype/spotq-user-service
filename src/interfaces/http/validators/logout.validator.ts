import { z } from "zod";

export const logoutSchema = z.object({
	refreshToken: z
		.string({ required_error: "Refresh token is required." })
		.min(1, "Refresh token cannot be empty."),
});

export type LogoutInput = z.infer<typeof logoutSchema>;
