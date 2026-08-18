import type {
	ILogoutUseCase,
	IRegisterUserUseCase,
	IResendEmailOtpUseCase,
	IVerifyEmailOtpUseCase,
} from "@ports/use-cases/index.ts";
import { TYPES } from "@config/di/types.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ResponseMessage } from "@shared/constants/index.ts";
import { sendSuccessResponse } from "@shared/response/index.ts";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.ts";
import { asyncHandler } from "../middlewares/async.middleware.ts";

@injectable()
export class UserController {
	constructor(
		@inject(TYPES.RegisterUserUseCase)
		private readonly _registerUserUseCase: IRegisterUserUseCase,
		@inject(TYPES.VerifyEmailOtpUseCase)
		private readonly _verifyEmailOtpUseCase: IVerifyEmailOtpUseCase,
		@inject(TYPES.ResendEmailOtpUseCase)
		private readonly _resendEmailOtpUseCase: IResendEmailOtpUseCase,
		@inject(TYPES.LogoutUseCase)
		private readonly _logoutUseCase: ILogoutUseCase,
	) {}

	public register = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const result = await this._registerUserUseCase.execute(req.body);
			sendSuccessResponse(
				res,
				result,
				ResponseMessage.REGISTRATION_SUCCESS,
				HttpStatus.CREATED,
			);
		},
	);

	public verifyEmail = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const result = await this._verifyEmailOtpUseCase.execute(req.body);
			sendSuccessResponse(res, undefined, result.message);
		},
	);

	public resendEmailOtp = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const result = await this._resendEmailOtpUseCase.execute(req.body);
			sendSuccessResponse(res, undefined, result.message);
		},
	);

	public logout = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const userId = req.user?.userId ?? "";
			const result = await this._logoutUseCase.execute({
				userId,
				refreshToken: req.body?.refreshToken,
			});
			sendSuccessResponse(res, undefined, result.message);
		},
	);
}
