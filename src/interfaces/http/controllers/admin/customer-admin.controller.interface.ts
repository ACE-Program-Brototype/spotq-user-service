import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.ts";

export interface ICustomerAdminController {
	listCustomers(req: AuthenticatedRequest, res: Response): Promise<void>;
	updateCustomerStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
}

