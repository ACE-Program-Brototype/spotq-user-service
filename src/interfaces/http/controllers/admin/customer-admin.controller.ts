import type { IListCustomersUseCase } from "@application/ports/use-cases/admin/list-customers.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { ForbiddenError, UnauthorizedError } from "@domain/errors/index.ts";
import { USER_ROLES } from "@shared/constants/auth.constants.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ResponseMessage } from "@shared/constants/response-messages.constants.ts";
import { sendSuccessResponse } from "@shared/response/index.ts";
import type { Response } from "express";
import { inject, injectable } from "inversify";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.ts";
import type { ICustomerAdminController } from "./customer-admin.controller.interface.ts";

@injectable()
export class CustomerAdminController implements ICustomerAdminController {
	constructor(
		@inject(TYPES.ListCustomersUseCase)
		private readonly listCustomersUseCase: IListCustomersUseCase,
	) {}

	public listCustomers = async (
		req: AuthenticatedRequest,
		res: Response,
	): Promise<void> => {
		const userId = req.user?.userId;

		if (!userId) {
			throw new UnauthorizedError();
		}

		if (
			req.user?.role &&
			req.user.role.toLowerCase() !== USER_ROLES.ADMIN &&
			req.user.role !== USER_ROLES.PLATFORM_ADMIN
		) {
			throw new ForbiddenError();
		}

		const query =
			(req as AuthenticatedRequest & { validatedQuery?: any }).validatedQuery ||
			req.query;
		const result = await this.listCustomersUseCase.execute(query);

		sendSuccessResponse(
			res,
			result,
			ResponseMessage.CUSTOMERS_FETCH_SUCCESS,
			HttpStatus.OK,
		);
	};
}
