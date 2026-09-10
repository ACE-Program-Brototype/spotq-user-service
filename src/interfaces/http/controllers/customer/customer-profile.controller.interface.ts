import type { AuthenticatedRequest } from "@interfaces/http/middlewares/auth.middleware.ts";
import type { Response } from "express";

export interface ICustomerProfileController {
	getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
}
