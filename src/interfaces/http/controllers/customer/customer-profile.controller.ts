import type { IGetCustomerProfileUseCase } from "@application/ports/use-cases/get-customer-profile.use-case.interface.ts";
import type { IUpdateCustomerProfileUseCase } from "@application/ports/use-cases/update-customer-profile.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { UnauthorizedError } from "@domain/errors/unauthorized.error.ts";
import { USER_ROLES } from "@shared/constants/auth.constants.ts";
import { DOMAIN_ERRORS } from "@shared/constants/error-messages.constants.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ResponseMessage } from "@shared/constants/response-messages.constants.ts";
import { ApiResponse } from "@shared/response/api-response.model.ts";
import { sendSuccessResponse } from "@shared/response/index.ts";
import type { Response } from "express";
import { inject, injectable } from "inversify";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.ts";

/**
 * Controller handling customer profile HTTP requests.
 */
@injectable()
export class CustomerProfileController {
	constructor(
		@inject(TYPES.GetCustomerProfileUseCase)
		private readonly getCustomerProfileUseCase: IGetCustomerProfileUseCase,
		@inject(TYPES.UpdateCustomerProfileUseCase)
		private readonly updateCustomerProfileUseCase: IUpdateCustomerProfileUseCase,
	) {}

	/**
	 * Retrieves the complete profile for the authenticated customer.
	 *
	 * @param req Authenticated HTTP request containing customer context
	 * @param res HTTP response
	 */
	public getProfile = async (
		req: AuthenticatedRequest,
		res: Response,
	): Promise<void> => {
		const userId = req.user?.userId;

		if (!userId) {
			throw new UnauthorizedError();
		}

		if (req.user?.role && req.user.role.toLowerCase() !== USER_ROLES.CUSTOMER) {
			res
				.status(HttpStatus.FORBIDDEN)
				.json(
					ApiResponse.fail(
						DOMAIN_ERRORS.MESSAGES.CUSTOMER_ONLY_ACCESS,
						HttpStatus.FORBIDDEN,
						DOMAIN_ERRORS.CODES.FORBIDDEN,
					),
				);
			return;
		}

		const profile = await this.getCustomerProfileUseCase.execute(userId);

		sendSuccessResponse(
			res,
			profile,
			ResponseMessage.CUSTOMER_PROFILE_FETCH_SUCCESS,
			HttpStatus.OK,
		);
	};

	/**
	 * Updates permitted personal profile information for the authenticated customer.
	 *
	 * @param req Authenticated HTTP request containing customer context and update body
	 * @param res HTTP response
	 */
	public updateProfile = async (
		req: AuthenticatedRequest,
		res: Response,
	): Promise<void> => {
		const userId = req.user?.userId;

		if (!userId) {
			throw new UnauthorizedError();
		}

		if (req.user?.role && req.user.role.toLowerCase() !== USER_ROLES.CUSTOMER) {
			res
				.status(HttpStatus.FORBIDDEN)
				.json(
					ApiResponse.fail(
						DOMAIN_ERRORS.MESSAGES.CUSTOMER_ONLY_ACCESS,
						HttpStatus.FORBIDDEN,
						DOMAIN_ERRORS.CODES.FORBIDDEN,
					),
				);
			return;
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
