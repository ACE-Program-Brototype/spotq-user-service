import type { AdminLoginDTO } from "@application/dtos/admin/auth/admin.login.dto";
import { IAdminForgotPasswordUseCase } from "@application/interface/admin/auth/IAdmin.forgot-password";
import type { IAdminLoginUseCase } from "@application/interface/admin/auth/IAdmin.login";
import type { IAdminLogoutUseCase } from "@application/interface/admin/auth/IAdmin.logout";
import { TYPES } from "@config/di/types";
import { config } from "@config/env.ts";
import { HttpStatus } from "@shared/constants";
import { authConstants } from "@shared/constants/auth.constants";
import { successResponse } from "@shared/response/api-response.model";
import { AppError } from "@shared/util/app.error";
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
		private readonly _adminForgotPasswordUseCase: IAdminForgotPasswordUseCase
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

			const temp_token = await this._adminForgotPasswordUseCase.execute(email)

			if(!temp_token){
				throw new AppError("Forgot Password failed", 500)
			}

			res.cookie("tempToken", temp_token, {
				httpOnly: config.cookie.httpOnly,
				secure: config.cookie.secure,
				sameSite: config.cookie.sameSite,
				maxAge: 300
			})

			successResponse(res, {}, "Forgot Password verification OTP send successfully")
		}
	)

}
