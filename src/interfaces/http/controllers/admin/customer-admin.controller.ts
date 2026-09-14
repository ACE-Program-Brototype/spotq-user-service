import type { IListCustomersUseCase } from "@application/ports/use-cases/admin/list-customers.use-case.interface.ts";
import type { IUpdateCustomerStatusUseCase } from "@application/ports/use-cases/admin/update-customer-status.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import type { UserStatus } from "@domain/entities/user.entity.ts";
import { ForbiddenError, UnauthorizedError } from "@domain/errors/index.ts";
import { authConstants, USER_ROLES } from "@shared/constants/auth.constants.ts";
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
		@inject(TYPES.UpdateCustomerStatusUseCase)
		private readonly updateCustomerStatusUseCase: IUpdateCustomerStatusUseCase,
	) {}

	public listCustomers = async (
		req: AuthenticatedRequest,
		res: Response,
	): Promise<void> => {
		const userId = req.user?.userId;

		if (!userId) {
			throw new UnauthorizedError();
		}

		const userRole = req.user?.role?.toUpperCase();
		const isAllowedAdmin =
			userRole === USER_ROLES.ADMIN.toUpperCase() ||
			userRole === USER_ROLES.PLATFORM_ADMIN.toUpperCase();

		if (req.user?.role && !isAllowedAdmin) {
			throw new ForbiddenError(authConstants.ADMIN_FORBIDDEN);
		}

		const query =
			(req as AuthenticatedRequest & { validatedQuery?: unknown })
				.validatedQuery || req.query;
		const result = await this.listCustomersUseCase.execute(query);

		sendSuccessResponse(
			res,
			result,
			ResponseMessage.CUSTOMERS_FETCH_SUCCESS,
			HttpStatus.OK,
		);
	};

	public updateCustomerStatus = async (
		req: AuthenticatedRequest,
		res: Response,
	): Promise<void> => {
		const adminUserId = req.user?.userId;

		if (!adminUserId) {
			throw new UnauthorizedError();
		}

		const userRole = req.user?.role?.toUpperCase();
		const isAllowedAdmin =
			userRole === USER_ROLES.ADMIN.toUpperCase() ||
			userRole === USER_ROLES.PLATFORM_ADMIN.toUpperCase();

		if (req.user?.role && !isAllowedAdmin) {
			throw new ForbiddenError(authConstants.ADMIN_FORBIDDEN);
		}

		const targetUserId = req.params.userId;
		const status = req.body.status as UserStatus;

		const result = await this.updateCustomerStatusUseCase.execute({
			userId: targetUserId,
			status,
		});

		const message =
			status === "BLOCKED"
				? ResponseMessage.CUSTOMER_BLOCKED_SUCCESS
				: ResponseMessage.CUSTOMER_UNBLOCKED_SUCCESS;

		sendSuccessResponse(res, result, message, HttpStatus.OK);
	};
}
