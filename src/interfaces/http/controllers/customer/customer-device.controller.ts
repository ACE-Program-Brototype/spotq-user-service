import type { IDeactivateDeviceUseCase } from "@application/ports/use-cases/deactivate-device.use-case.interface.ts";
import type { IGetCustomerDevicesUseCase } from "@application/ports/use-cases/get-customer-devices.use-case.interface.ts";
import type { IRegisterDeviceUseCase } from "@application/ports/use-cases/register-device.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { UnauthorizedError } from "@domain/errors/index.ts";
import type { AuthenticatedRequest } from "@interfaces/http/middlewares/auth.middleware.ts";
import { HttpStatus, ResponseMessage } from "@shared/constants/index.ts";
import { sendSuccessResponse } from "@shared/response/index.ts";
import type { Response } from "express";
import { inject, injectable } from "inversify";
import type { ICustomerDeviceController } from "./customer-device.controller.interface.ts";

@injectable()
export class CustomerDeviceController implements ICustomerDeviceController {
	constructor(
		@inject(TYPES.RegisterDeviceUseCase)
		private readonly registerDeviceUseCase: IRegisterDeviceUseCase,
		@inject(TYPES.GetCustomerDevicesUseCase)
		private readonly getCustomerDevicesUseCase: IGetCustomerDevicesUseCase,
		@inject(TYPES.DeactivateDeviceUseCase)
		private readonly deactivateDeviceUseCase: IDeactivateDeviceUseCase,
	) {}

	public registerDevice = async (
		req: AuthenticatedRequest,
		res: Response,
	): Promise<void> => {
		const userId = req.user?.userId;
		if (!userId) {
			throw new UnauthorizedError();
		}

		const body = req.body;
		const result = await this.registerDeviceUseCase.execute({
			userId,
			deviceId: body.deviceId,
			fid: body.fid,
			platform: body.platform,
			appVersion: body.appVersion,
			deviceName: body.deviceName,
		});

		sendSuccessResponse(
			res,
			{
				device_id: result.deviceId,
				platform: result.platform,
				is_active: result.isActive,
			},
			ResponseMessage.DEVICE_REGISTERED_SUCCESS,
			HttpStatus.OK,
		);
	};

	public getDevices = async (
		req: AuthenticatedRequest,
		res: Response,
	): Promise<void> => {
		const userId = req.user?.userId;
		if (!userId) {
			throw new UnauthorizedError();
		}

		const devices = await this.getCustomerDevicesUseCase.execute(userId);

		sendSuccessResponse(
			res,
			devices,
			ResponseMessage.CUSTOMER_DEVICES_FETCH_SUCCESS,
			HttpStatus.OK,
		);
	};

	public deactivateDevice = async (
		req: AuthenticatedRequest,
		res: Response,
	): Promise<void> => {
		const userId = req.user?.userId;
		if (!userId) {
			throw new UnauthorizedError();
		}

		const deviceId = req.params.deviceId as string;
		await this.deactivateDeviceUseCase.execute({
			userId,
			deviceId,
		});

		sendSuccessResponse(
			res,
			null,
			ResponseMessage.DEVICE_DEACTIVATED_SUCCESS,
			HttpStatus.OK,
		);
	};
}
