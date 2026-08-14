import type {
	LogoutUseCase,
	RegisterUserUseCase,
	ResendEmailOtpUseCase,
	VerifyEmailOtpUseCase,
} from "@application/use-cases/index.ts";
import { TYPES } from "@config/di/types.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ApiResponse } from "@shared/response/api-response.model.ts";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.ts";

@injectable()
export class UserController {
	constructor(
		@inject(TYPES.RegisterUserUseCase)
		private readonly registerUserUseCase: RegisterUserUseCase,
		@inject(TYPES.VerifyEmailOtpUseCase)
		private readonly verifyEmailOtpUseCase: VerifyEmailOtpUseCase,
		@inject(TYPES.ResendEmailOtpUseCase)
		private readonly resendEmailOtpUseCase: ResendEmailOtpUseCase,
		@inject(TYPES.LogoutUseCase)
		private readonly logoutUseCase: LogoutUseCase,
	) {}

	public register = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const result = await this.registerUserUseCase.execute(req.body);
			res
				.status(HttpStatus.CREATED)
				.json(
					ApiResponse.ok(
						result,
						"Registration successful. A verification OTP has been queued for delivery to your email.",
						HttpStatus.CREATED,
					),
				);
		} catch (error) {
			next(error);
		}
	};

	public verifyEmail = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const result = await this.verifyEmailOtpUseCase.execute(req.body);
			res
				.status(HttpStatus.OK)
				.json(ApiResponse.ok(undefined, result.message, HttpStatus.OK));
		} catch (error) {
			next(error);
		}
	};

	public resendEmailOtp = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const result = await this.resendEmailOtpUseCase.execute(req.body);
			res
				.status(HttpStatus.OK)
				.json(ApiResponse.ok(undefined, result.message, HttpStatus.OK));
		} catch (error) {
			next(error);
		}
	};

	public logout = async (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userId = req.user?.userId ?? "";
			const result = await this.logoutUseCase.execute({
				userId,
				refreshToken: req.body?.refreshToken,
			});
			res
				.status(HttpStatus.OK)
				.json(ApiResponse.ok(undefined, result.message, HttpStatus.OK));
		} catch (error) {
			next(error);
		}
	};
}
