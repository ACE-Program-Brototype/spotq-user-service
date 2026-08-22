import type {
	GoogleAuthDto,
	LoginDto,
	RegisterUserDto,
	ResendEmailOtpDto,
	VerifyEmailOtpDto,
} from "@application/dtos/index.ts";

import { TYPES } from "@config/di/types.ts";
import { config } from "@config/env.ts";
import type {
	IGoogleAuthUseCase,
	ILoginUseCase,
	ILogoutUseCase,
	IRefreshTokenUseCase,
	IRegisterUserUseCase,
	IResendEmailOtpUseCase,
	IVerifyEmailOtpUseCase,
} from "@ports/use-cases/index.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ResponseMessage } from "@shared/constants/index.ts";
import { sendSuccessResponse } from "@shared/response/index.ts";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.ts";

@injectable()
export class UserAuthController {
	constructor(
		@inject(TYPES.RegisterUserUseCase)
		private readonly registerUserUseCase: IRegisterUserUseCase,
		@inject(TYPES.VerifyEmailOtpUseCase)
		private readonly verifyEmailOtpUseCase: IVerifyEmailOtpUseCase,
		@inject(TYPES.ResendEmailOtpUseCase)
		private readonly resendEmailOtpUseCase: IResendEmailOtpUseCase,
		@inject(TYPES.LogoutUseCase)
		private readonly logoutUseCase: ILogoutUseCase,
		@inject(TYPES.GoogleAuthUseCase)
		private readonly googleAuthUseCase: IGoogleAuthUseCase,
		@inject(TYPES.LoginUseCase)
		private readonly loginUseCase: ILoginUseCase,
		@inject(TYPES.RefreshTokenUseCase)
		private readonly refreshTokenUseCase: IRefreshTokenUseCase,
	) {}

	private getCookie(req: Request, name: string): string | undefined {
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
		const result = await this.registerUserUseCase.execute(
			req.body as RegisterUserDto,
		);

		res.cookie("refreshToken", result.refreshToken, {
			httpOnly: config.cookie.httpOnly,
			secure: config.cookie.secure,
			sameSite: config.cookie.sameSite,
			maxAge: Number(config.cookie.refreshMaxAge),
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
		const result = await this.verifyEmailOtpUseCase.execute(
			req.body as VerifyEmailOtpDto,
		);
		sendSuccessResponse(res, undefined, result.message);
	};

	public resendEmailOtp = async (
		req: Request,
		res: Response,
	): Promise<void> => {
		const result = await this.resendEmailOtpUseCase.execute(
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
			(req as Request & { cookies?: Record<string, string> }).cookies
				?.refreshToken ||
			this.getCookie(req, "refreshToken") ||
			"";

		const result = await this.logoutUseCase.execute({
			userId,
			refreshToken,
		});

		res.clearCookie("refreshToken", {
			httpOnly: config.cookie.httpOnly,
			secure: config.cookie.secure,
			sameSite: config.cookie.sameSite,
		});

		sendSuccessResponse(res, undefined, result.message);
	};

	public googleAuth = async (req: Request, res: Response): Promise<void> => {
		const result = await this.googleAuthUseCase.execute(
			req.body as GoogleAuthDto,
		);

		res.cookie("refreshToken", result.refreshToken, {
			httpOnly: config.cookie.httpOnly,
			secure: config.cookie.secure,
			sameSite: config.cookie.sameSite,
			maxAge: Number(config.cookie.refreshMaxAge),
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
		const result = await this.loginUseCase.execute(req.body as LoginDto);

		res.cookie("refreshToken", result.refresh_token, {
			httpOnly: config.cookie.httpOnly,
			secure: config.cookie.secure,
			sameSite: config.cookie.sameSite,
			maxAge: Number(config.cookie.refreshMaxAge),
		});

		const { refresh_token, ...responseBody } = result;

		sendSuccessResponse(res, responseBody, "Login successful.", HttpStatus.OK);
	};

	public refresh = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const refreshToken =
				req.body?.refreshToken ||
				(req as Request & { cookies?: Record<string, string> }).cookies
					?.refreshToken ||
				this.getCookie(req, "refreshToken") ||
				"";

			const result = await this.refreshTokenUseCase.execute({
				refreshToken,
			});

			res.cookie("refreshToken", result.refreshToken, {
				httpOnly: config.cookie.httpOnly,
				secure: config.cookie.secure,
				sameSite: config.cookie.sameSite,
				maxAge: Number(config.cookie.refreshMaxAge),
			});

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
				"Token refreshed successfully.",
				HttpStatus.OK,
			);
		} catch (error) {
			res.clearCookie("refreshToken", {
				httpOnly: config.cookie.httpOnly,
				secure: config.cookie.secure,
				sameSite: config.cookie.sameSite,
			});
			next(error);
		}
	};
}
