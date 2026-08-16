import type { AdminLoginDTO } from "@application/dtos/admin/auth/admin.login.dto";
import type { IAdminLoginUseCase } from "@application/interface/admin/auth/IAdmin.login";
import { TYPES } from "@config/di/types";
import { HttpStatus } from "@shared/constants";
import { loginConstants } from "@shared/constants/auth.constants";
import type { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { inject, injectable } from "inversify";

@injectable()
export class AdminAuthController {
	constructor(
		@inject(TYPES.AdminLoginUseCase)
		private readonly _adminLoginUseCase: IAdminLoginUseCase,
	) {}

	login = expressAsyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { email, password } = req.body;

			const { access_token, refresh_token, user } =
				(await this._adminLoginUseCase.execute(
					email,
					password,
				)) as AdminLoginDTO;

			res
				.status(HttpStatus.OK)
				.cookie("token", refresh_token, {
					httpOnly: true,
					secure: true,
					sameSite: "strict",
				})
				.json({
					success: true,
					message: loginConstants.ADMIN_LOGIN_SUCCESS,
					data: { access_token, user },
				});
		},
	);
}
