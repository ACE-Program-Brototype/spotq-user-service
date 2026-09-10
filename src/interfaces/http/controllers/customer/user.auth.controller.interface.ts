import type { AuthenticatedRequest } from "@interfaces/http/middlewares/auth.middleware.ts";
import type { Request, Response } from "express";

export interface IUserAuthController {
	register(req: Request, res: Response): Promise<void>;
	verifyEmail(req: Request, res: Response): Promise<void>;
	resendEmailOtp(req: Request, res: Response): Promise<void>;
	logout(req: AuthenticatedRequest, res: Response): Promise<void>;
	googleAuth(req: Request, res: Response): Promise<void>;
	login(req: Request, res: Response): Promise<void>;
	refresh(req: Request, res: Response): Promise<void>;
	forgotPassword(req: Request, res: Response): Promise<void>;
	forgotPasswordEmailVerify(req: Request, res: Response): Promise<void>;
	verifyOtpResend(req: Request, res: Response): Promise<void>;
	resetPassword(req: Request, res: Response): Promise<void>;
}
