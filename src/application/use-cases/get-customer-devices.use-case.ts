import type { CustomerDeviceResponseDto } from "@application/dtos/device.dto.ts";
import { DeviceDtoMapper } from "@application/mappers/device-dto.mapper.ts";
import { TYPES } from "@config/di/types.ts";
import type { IDeviceRepository } from "@domain/repositories/device.repository.interface.ts";
import type { IGetCustomerDevicesUseCase } from "@ports/use-cases/index.ts";
import { inject, injectable } from "inversify";

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
