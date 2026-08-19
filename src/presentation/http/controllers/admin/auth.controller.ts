
import type { IAdminForgotPasswordUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.forgot-password";
import type { IAdminLoginUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.login";
import type { IAdminLogoutUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.logout";
import type { IAdminResetPasswordUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.reset.password";
import type { IAdminVerifyEmailForgotPasswordUseCase } from "@application/ports/use-cases/admin/auth/IVerify.email.forgot-password";
import { TYPES } from "@config/di/types";
import { config } from "@config/env.ts";
import { HttpStatus } from "@shared/constants";
import { authConstants } from "@shared/constants/auth.constants";
import { successResponse } from "@shared/response/api-response.model";
import { AppError } from "@shared/util/app.error";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
@injectable()
export class AdminAuthController {
	constructor(
		@inject(TYPES.AdminLoginUseCase)
		private readonly _adminLoginUseCase: IAdminLoginUseCase,
		@inject(TYPES.AdminLogoutUseCase)
		private readonly _adminLogoutUseCase: IAdminLogoutUseCase,
		@inject(TYPES.AdminForgotPasswordUseCase)
		private readonly _adminForgotPasswordUseCase: IAdminForgotPasswordUseCase,
		@inject(TYPES.AdminForgotPasswordEmailVerifyUseCase)
		private readonly _adminForgotPasswordVerifyEmailUseCase: IAdminVerifyEmailForgotPasswordUseCase,
		@inject(TYPES.AdminResetPasswordUseCase)
		private readonly _adminResetPasswordUseCase: IAdminResetPasswordUseCase,
	) { }

	login = async (req: Request, res: Response): Promise<void> => {
		const { email, password } = req.body;

		const { access_token, refresh_token, user } =
			await this._adminLoginUseCase.execute(email, password);

		res.cookie("refreshToken", refresh_token, {
			httpOnly: config.cookie.httpOnly,
			secure: config.cookie.secure,
			sameSite: config.cookie.sameSite,
			maxAge: Number(config.cookie.refreshMaxAge),
		});

		successResponse(
			res,
			{ user, access_token },
			authConstants.ADMIN_LOGIN_SUCCESS,
			HttpStatus.OK,
		);
	}


	logout = async (req: Request, res: Response): Promise<void> => {
		const refreshToken = req.cookies.refreshToken;

		if (refreshToken) {
			await this._adminLogoutUseCase.execute(refreshToken);
		}

		res.clearCookie("refreshToken", {
			httpOnly: config.cookie.httpOnly,
			secure: config.cookie.secure,
			sameSite: config.cookie.sameSite,
		});

		successResponse(
			res,
			{},
			authConstants.ADMIN_LOGOUT_SUCCESS,
			HttpStatus.OK,
		);
	}

	forgotPassword = async (req: Request, res: Response): Promise<void> => {
		const { email } = req.body;

		await this._adminForgotPasswordUseCase.execute(email);

		successResponse(
			res,
			{},
			authConstants.FORGOT_PASSWORD_VERIFICATION_OTP_SUCCESS,
		);
	}

	forgotPasswordEmailVerify = async (req: Request, res: Response): Promise<void> => {
		const { email, otp } = req.body;

		const tempToken =
			await this._adminForgotPasswordVerifyEmailUseCase.execute(email, otp);

		res.cookie("tempToken", tempToken, {
			httpOnly: config.cookie.httpOnly,
			secure: config.cookie.secure,
			sameSite: config.cookie.sameSite,
			maxAge: Number(config.cookie.tempMaxAge),
			path: "/",
		});

		successResponse(res, {}, authConstants.EMAIL_VERIFIED_SUCCESS);
	}

	verifyOtpResend = async (req: Request, res: Response): Promise<void> => {
		const { email } = req.body;

		await this._adminForgotPasswordUseCase.execute(email);

		successResponse(
			res,
			{},
			authConstants.FORGOT_PASSWORD_VERIFICATION_OTP_RESEND_SUCCESS,
		);
	}

	resetPassword = async (req: Request, res: Response): Promise<void> => {
		const userId = req.userId;
		const { password } = req.body;

		if (!userId) {
			throw new AppError(
				authConstants.USER_NOT_FOUND,
				HttpStatus.BAD_REQUEST,
			);
		}

		const user = await this._adminResetPasswordUseCase.execute(
			userId,
			password,
		);

		res.clearCookie("tempToken", {
			httpOnly: config.cookie.httpOnly,
			secure: config.cookie.secure,
			sameSite: config.cookie.sameSite,
		});

		successResponse(res, user, authConstants.PASSWORD_RESET_SUCCESS);
	}
}
