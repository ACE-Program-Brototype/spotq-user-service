import type { DeactivateDeviceDto } from "@application/dtos/device.dto.ts";
import type { ILogger } from "@application/ports/services/index.ts";
import { TYPES } from "@config/di/types.ts";
import type { IDeviceRepository } from "@domain/repositories/device.repository.interface.ts";
import type { IDeactivateDeviceUseCase } from "@ports/use-cases/index.ts";
import { inject, injectable } from "inversify";

@injectable()
export class DeactivateDeviceUseCase implements IDeactivateDeviceUseCase {
	constructor(
		@inject(TYPES.DeviceRepository)
		private readonly deviceRepository: IDeviceRepository,
		@inject(TYPES.Logger)
		private readonly logger: ILogger,
	) {}

	public async execute(dto: DeactivateDeviceDto): Promise<void> {
		if (dto.deviceId) {
			await this.deviceRepository.deactivate(dto.userId, dto.deviceId);
			this.logger.info(
				{
					userId: dto.userId,
					deviceId: dto.deviceId,
					event: "DEVICE_DEACTIVATED",
				},
				"Device token deactivated successfully",
			);
		} else if (dto.fid) {
			await this.deviceRepository.deactivateByFid(dto.fid);
			this.logger.info(
				{
					fid: dto.fid,
					event: "DEVICE_TOKEN_DEACTIVATED",
				},
				"Device FID marked inactive",
			);
		}
	}
}
