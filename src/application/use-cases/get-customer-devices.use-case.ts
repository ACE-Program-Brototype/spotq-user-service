import { TYPES } from "@config/di/types.ts";
import type { IDeviceRepository } from "@domain/repositories/device.repository.interface.ts";
import type { IGetCustomerDevicesUseCase } from "@ports/use-cases/index.ts";
import { inject, injectable } from "inversify";
import type { CustomerDeviceResponseDto } from "../dtos/device.dto.ts";
import { DeviceDtoMapper } from "../mappers/device-dto.mapper.ts";

@injectable()
export class GetCustomerDevicesUseCase implements IGetCustomerDevicesUseCase {
	constructor(
		@inject(TYPES.DeviceRepository)
		private readonly deviceRepository: IDeviceRepository,
	) {}

	public async execute(userId: string): Promise<CustomerDeviceResponseDto[]> {
		const devices = await this.deviceRepository.findActiveByUserId(userId);

		return DeviceDtoMapper.toResponseList(devices);
	}
}
