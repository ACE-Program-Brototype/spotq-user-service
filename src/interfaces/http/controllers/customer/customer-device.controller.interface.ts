import type { AuthenticatedRequest } from "@interfaces/http/middlewares/auth.middleware.ts";
import type { Response } from "express";

export interface ICustomerDeviceController {
	registerDevice(req: AuthenticatedRequest, res: Response): Promise<void>;
	getDevices(req: AuthenticatedRequest, res: Response): Promise<void>;
	deactivateDevice(req: AuthenticatedRequest, res: Response): Promise<void>;
}
