import type { AuthenticatedRequest } from "@interfaces/http/middlewares/auth.middleware.ts";
import type { Response } from "express";

export interface ICustomerAdminController {
	listCustomers(req: AuthenticatedRequest, res: Response): Promise<void>;
	updateCustomerStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
}
