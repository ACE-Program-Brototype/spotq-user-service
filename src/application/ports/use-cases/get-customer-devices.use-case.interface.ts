import type { CustomerDeviceResponseDto } from "../../dtos/device.dto.ts";
import type { IUseCase } from "./base.use-case.interface.ts";

export interface IGetCustomerDevicesUseCase
	extends IUseCase<string, CustomerDeviceResponseDto[]> {}
