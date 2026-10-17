import type { DeactivateDeviceDto } from "@application/dtos/device.dto.ts";
import type { IUseCase } from "./base.use-case.interface.ts";

export interface IDeactivateDeviceUseCase
	extends IUseCase<DeactivateDeviceDto, void> {}
