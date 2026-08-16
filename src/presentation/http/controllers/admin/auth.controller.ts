import type { AdminLoginDTO } from "@application/dtos/admin/auth/admin.login.dto";
import type { IAdminLoginUseCase } from "@application/interface/admin/auth/IAdmin.login";
import { TYPES } from "@config/di/types";
import { HttpStatus } from "@shared/constants";
import { loginConstants } from "@shared/constants/auth.constants";
import { successResponse } from "@shared/response/api-response.model";
import type { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { inject, injectable } from "inversify";
import { config } from "@config/env.ts";
import { IAdminLogoutUseCase } from "@application/interface/admin/auth/IAdmin.logout";
@injectable()
export class AdminAuthController {
	constructor(
		@inject(TYPES.AdminLoginUseCase)
		private readonly _adminLoginUseCase: IAdminLoginUseCase,
		@inject(TYPES.AdminLogoutUseCase)
		private readonly _adminLogoutUseCase: IAdminLogoutUseCase,
	) { }

	login = expressAsyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { email, password } = req.body;

			const { access_token, refresh_token, user } = await this._adminLoginUseCase.execute(
				email,
				password,
			) as AdminLoginDTO;

			res.cookie("token", refresh_token, {
				httpOnly: config.cookie.httpOnly,
				secure: config.cookie.secure,
				sameSite: config.cookie.sameSite,
			})

			successResponse(res, { access_token, user }, loginConstants.ADMIN_LOGIN_SUCCESS, HttpStatus.OK);
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
				loginConstants.ADMIN_LOGOUT_SUCCESS,
				HttpStatus.OK,
			);
		},
	);
}
