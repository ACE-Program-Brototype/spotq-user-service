import type {
	GoogleAuthDto,
	LoginDto,
	RegisterUserDto,
	ResendEmailOtpDto,
	VerifyEmailOtpDto,
} from "@application/dtos/index.ts";

import { TYPES } from "@config/di/types.ts";

import type {
	IGoogleAuthUseCase,
	ILoginUseCase,
	ILogoutUseCase,
	IRegisterUserUseCase,
	IResendEmailOtpUseCase,
	IVerifyEmailOtpUseCase,
} from "@ports/use-cases/index.ts";

import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ResponseMessage } from "@shared/constants/index.ts";
import { sendSuccessResponse } from "@shared/response/index.ts";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.ts";

@injectable()
export class UserAuthController {
	constructor(
		@inject(TYPES.RegisterUserUseCase)
		private readonly _registerUserUseCase: IRegisterUserUseCase,
		@inject(TYPES.VerifyEmailOtpUseCase)
		private readonly _verifyEmailOtpUseCase: IVerifyEmailOtpUseCase,
		@inject(TYPES.ResendEmailOtpUseCase)
		private readonly _resendEmailOtpUseCase: IResendEmailOtpUseCase,
		@inject(TYPES.LogoutUseCase)
		private readonly _logoutUseCase: ILogoutUseCase,
		@inject(TYPES.GoogleAuthUseCase)
		private readonly _googleAuthUseCase: IGoogleAuthUseCase,
		@inject(TYPES.LoginUseCase)
		private readonly _loginUseCase: ILoginUseCase,
	) {}

	private _getCookie(req: Request, name: string): string | undefined {
		const rc = req.headers.cookie;
		if (!rc) return undefined;
		const list: Record<string, string> = {};
		for (const cookie of rc.split(";")) {
			const parts = cookie.split("=");
			const key = parts.shift()?.trim();
			if (key) {
				list[key] = decodeURIComponent(parts.join("="));
			}
		}
		return list[name];
	}

	public register = async (req: Request, res: Response): Promise<void> => {
		const result = await this._registerUserUseCase.execute(
			req.body as RegisterUserDto,
		);

		res.cookie("refreshToken", result.refreshToken, {
			httpOnly: true,
			secure:
				process.env.NODE_ENV === "production" ||
				process.env.NODE_ENV === "staging",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		const { refreshToken, ...responseBody } = result;

		sendSuccessResponse(
			res,
			responseBody,
			ResponseMessage.REGISTRATION_SUCCESS,
			HttpStatus.CREATED,
		);
	};

	public verifyEmail = async (req: Request, res: Response): Promise<void> => {
		const result = await this._verifyEmailOtpUseCase.execute(
			req.body as VerifyEmailOtpDto,
		);
		sendSuccessResponse(res, undefined, result.message);
	};

	public resendEmailOtp = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		const result = await this._resendEmailOtpUseCase.execute(
			req.body as ResendEmailOtpDto,
		);
		sendSuccessResponse(res, undefined, result.message);
	};

	public logout = async (
		req: AuthenticatedRequest,
		res: Response,
	): Promise<void> => {
		const userId = req.user?.userId ?? "";
		const refreshToken =
			req.body?.refreshToken ||
			(req as any).cookies?.refreshToken ||
			this._getCookie(req, "refreshToken") ||
			"";

		const result = await this._logoutUseCase.execute({
			userId,
			refreshToken,
		});

		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure:
				process.env.NODE_ENV === "production" ||
				process.env.NODE_ENV === "staging",
			sameSite: "strict",
		});

		sendSuccessResponse(res, undefined, result.message);
	};

	public googleAuth = async (req: Request, res: Response): Promise<void> => {
		const result = await this._googleAuthUseCase.execute(
			req.body as GoogleAuthDto,
		);

		res.cookie("refreshToken", result.refreshToken, {
			httpOnly: true,
			secure:
				process.env.NODE_ENV === "production" ||
				process.env.NODE_ENV === "staging",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		// Exclude refreshToken from body payload and use snake_case for response mapping
		const responseBody = {
			user: {
				id: result.user.id,
				full_name: result.user.fullName,
				email: result.user.email,
				status: result.user.status,
			},
			access_token: result.accessToken,
		};

		sendSuccessResponse(
			res,
			responseBody,
			"Google authentication successful.",
			HttpStatus.OK,
		);
	};

	public login = async (req: Request, res: Response): Promise<void> => {
		const result = await this._loginUseCase.execute(req.body as LoginDto);

		res.cookie("refreshToken", result.refreshToken, {
			httpOnly: true,
			secure:
				process.env.NODE_ENV === "production" ||
				process.env.NODE_ENV === "staging",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		sendSuccessResponse(res, result, "Login successful.", HttpStatus.OK);
	};
}
