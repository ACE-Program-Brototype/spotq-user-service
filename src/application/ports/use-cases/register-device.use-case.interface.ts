import type {
	RegisterCustomerDeviceDto,
	RegisterDeviceResultDto,
} from "../../dtos/device.dto.ts";
import type { IUseCase } from "./base.use-case.interface.ts";

export interface IRegisterDeviceUseCase
	extends IUseCase<RegisterCustomerDeviceDto, RegisterDeviceResultDto> {}
