import type { IGetCustomerProfileUseCase } from "@application/ports/use-cases/get-customer-profile.use-case.interface.ts";
import type { IUpdateCustomerProfileUseCase } from "@application/ports/use-cases/update-customer-profile.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { ForbiddenError, UnauthorizedError } from "@domain/errors/index.ts";
import { USER_ROLES } from "@shared/constants/auth.constants.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ResponseMessage } from "@shared/constants/response-messages.constants.ts";
import { sendSuccessResponse } from "@shared/response/index.ts";
import type { Response } from "express";
import { inject, injectable } from "inversify";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.ts";
import type { ICustomerProfileController } from "./customer-profile.controller.interface.ts";

@injectable()
export class CustomerProfileController implements ICustomerProfileController {
	constructor(
		@inject(TYPES.GetCustomerProfileUseCase)
		private readonly getCustomerProfileUseCase: IGetCustomerProfileUseCase,
		@inject(TYPES.UpdateCustomerProfileUseCase)
		private readonly updateCustomerProfileUseCase: IUpdateCustomerProfileUseCase,
	) {}

	public getProfile = async (
		req: AuthenticatedRequest,
		res: Response,
	): Promise<void> => {
		const userId = req.user?.userId;

		if (!userId) {
			throw new UnauthorizedError();
		}

		if (req.user?.role && req.user.role.toLowerCase() !== USER_ROLES.CUSTOMER) {
			throw new ForbiddenError();
		}

		const profile = await this.getCustomerProfileUseCase.execute(userId);

		sendSuccessResponse(
			res,
			profile,
			ResponseMessage.CUSTOMER_PROFILE_FETCH_SUCCESS,
			HttpStatus.OK,
		);
	};

	public updateProfile = async (
		req: AuthenticatedRequest,
		res: Response,
	): Promise<void> => {
		const userId = req.user?.userId;

		if (!userId) {
			throw new UnauthorizedError();
		}

		if (req.user?.role && req.user.role.toLowerCase() !== USER_ROLES.CUSTOMER) {
			throw new ForbiddenError();
		}

		const updatedProfile = await this.updateCustomerProfileUseCase.execute(
			userId,
			req.body,
		);

		sendSuccessResponse(
			res,
			updatedProfile,
			ResponseMessage.CUSTOMER_PROFILE_UPDATE_SUCCESS,
			HttpStatus.OK,
		);
	};
}
