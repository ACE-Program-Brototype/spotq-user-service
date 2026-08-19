import type { IAdminLoginUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.login";
import type { IAdminLogoutUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.logout";
import { TYPES } from "@config/di/types";
import { config } from "@config/env.ts";
import { HttpStatus } from "@shared/constants";
import { loginConstants } from "@shared/constants/auth.constants";
import { successResponse } from "@shared/response/api-response.model";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
@injectable()
export class AdminAuthController {
	constructor(
		@inject(TYPES.AdminLoginUseCase)
		private readonly _adminLoginUseCase: IAdminLoginUseCase,
		@inject(TYPES.AdminLogoutUseCase)
		private readonly _adminLogoutUseCase: IAdminLogoutUseCase,
	) {}

	login = async (req: Request, res: Response): Promise<void> => {
		const { email, password } = req.body;

		const { access_token, refresh_token, user } =
			await this._adminLoginUseCase.execute(email, password);

		res.cookie("refreshToken", refresh_token, {
			httpOnly: config.cookie.httpOnly,
			secure: config.cookie.secure,
			sameSite: config.cookie.sameSite,
		});

		successResponse(
			res,
			{ user, access_token },
			loginConstants.ADMIN_LOGIN_SUCCESS,
			HttpStatus.OK,
		);
	};

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
			loginConstants.ADMIN_LOGOUT_SUCCESS,
			HttpStatus.OK,
		);
	};
}
