import type {
	RegisterUserDto,
	ResendEmailOtpDto,
	VerifyEmailOtpDto,
} from "@application/dtos/index.ts";
import { TYPES } from "@config/di/types.ts";
import type { AuthenticatedRequest } from "@interfaces/http/middlewares/auth.middleware";
import type {
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

	public async register(req: Request, res: Response): Promise<void> {
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
	}

	public async verifyEmail(req: Request, res: Response): Promise<void> {
		const result = await this._verifyEmailOtpUseCase.execute(
			req.body as VerifyEmailOtpDto,
		);
		sendSuccessResponse(res, undefined, result.message);
	}

	public async resendEmailOtp(req: Request, res: Response): Promise<void> {
		const result = await this._resendEmailOtpUseCase.execute(
			req.body as ResendEmailOtpDto,
		);
		sendSuccessResponse(res, undefined, result.message);
	}

	public async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
		const userId = req.user?.userId ?? "";
		const refreshToken =
			req.body?.refreshToken || this._getCookie(req, "refreshToken") || "";

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
	}
}
