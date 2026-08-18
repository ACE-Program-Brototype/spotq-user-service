import type { AdminLoginDTO } from "@application/dtos/admin/auth/admin.login.dto";
import { IAdminForgotPasswordUseCase } from "@application/interface/admin/auth/IAdmin.forgot-password";
import type { IAdminLoginUseCase } from "@application/interface/admin/auth/IAdmin.login";
import type { IAdminLogoutUseCase } from "@application/interface/admin/auth/IAdmin.logout";
import { IAdminVerifyEmailForgotPasswordUseCase } from "@application/interface/admin/auth/IVerify.email.forgot-password";
import { TYPES } from "@config/di/types";
import { config } from "@config/env.ts";
import { HttpStatus } from "@shared/constants";
import { authConstants } from "@shared/constants/auth.constants";
import { successResponse } from "@shared/response/api-response.model";
import type { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
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
		private readonly _adminForgotPasswordVerifyEmailUseCase : IAdminVerifyEmailForgotPasswordUseCase
	) { }

	login = expressAsyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { email, password } = req.body;

			const { access_token, refresh_token, user } =
				(await this._adminLoginUseCase.execute(
					email,
					password,
				)) as AdminLoginDTO;

			res.cookie("token", refresh_token, {
				httpOnly: config.cookie.httpOnly,
				secure: config.cookie.secure,
				sameSite: config.cookie.sameSite,
				maxAge: Number(config.cookie.refreshMaxAge)
			});

			successResponse(
				res,
				{ user, access_token },
				authConstants.ADMIN_LOGIN_SUCCESS,
				HttpStatus.OK,
			);
		},
	);

	logout = expressAsyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const refreshToken = req.cookies.token;

			if (refreshToken) {
				await this._adminLogoutUseCase.execute(refreshToken);
			}

			res.clearCookie("token", {
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
		},
	);


	forgotPassword = expressAsyncHandler(
		async (req: Request, res: Response): Promise<void> => {

			const { email } = req.body

			await this._adminForgotPasswordUseCase.execute(email)

			successResponse(res, {}, authConstants.FORGOT_PASSWORD_VERIFICATION_OTP_SUCCESS)
		}
	)

	forgotPasswordEmailVerify = expressAsyncHandler(
		async(req: Request, res: Response): Promise<void> => {

			const { email, otp } = req.body

			const tempToken = await this._adminForgotPasswordVerifyEmailUseCase.execute(email, otp)

			res.cookie("tempToken", tempToken, {
				httpOnly: config.cookie.httpOnly,
				secure: config.cookie.secure,
				sameSite: config.cookie.sameSite,
				maxAge: Number(config.cookie.tempMaxAge)
			})

			successResponse(res, {} , authConstants.EMAIL_VERIFIED_SUCCESS)

		}
	)

}
