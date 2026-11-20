import type { IGetAdminCustomerDetailsUseCase } from "@application/ports/use-cases/admin/get-admin-customer-details.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ResponseMessage } from "@shared/constants/response-messages.constants.ts";
import { sendSuccessResponse } from "@shared/response/index.ts";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class AdminCustomerController {
	constructor(
		@inject(TYPES.GetAdminCustomerDetailsUseCase)
		private readonly getAdminCustomerDetailsUseCase: IGetAdminCustomerDetailsUseCase,
	) {}

	public getCustomerDetails = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { id } = req.params;
			const customerDetails = await this.getAdminCustomerDetailsUseCase.execute(
				id as string,
			);

			sendSuccessResponse(
				res,
				customerDetails,
				ResponseMessage.ADMIN_CUSTOMER_DETAILS_FETCH_SUCCESS,
				HttpStatus.OK,
			);
		} catch (error) {
			next(error);
		}
	};
}
