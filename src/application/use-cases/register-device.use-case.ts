import type {
	IIdGenerator,
	ILogger,
} from "@application/ports/services/index.ts";
import { TYPES } from "@config/di/types.ts";
import { DeviceEntity } from "@domain/entities/device.entity.ts";
import type { IDeviceRepository } from "@domain/repositories/device.repository.interface.ts";
import type { IRegisterDeviceUseCase } from "@ports/use-cases/index.ts";
import { inject, injectable } from "inversify";
import type {
	RegisterCustomerDeviceDto,
	RegisterDeviceResultDto,
} from "../dtos/device.dto.ts";
import { DeviceDtoMapper } from "../mappers/device-dto.mapper.ts";

@injectable()
export class RegisterDeviceUseCase implements IRegisterDeviceUseCase {
	constructor(
		@inject(TYPES.DeviceRepository)
		private readonly deviceRepository: IDeviceRepository,
		@inject(TYPES.IdGenerator)
		private readonly idGenerator: IIdGenerator,
		@inject(TYPES.Logger)
		private readonly logger: ILogger,
	) {}

	public async execute(
		dto: RegisterCustomerDeviceDto,
	): Promise<RegisterDeviceResultDto> {
		let device = await this.deviceRepository.findByUserIdAndDeviceId(
			dto.userId,
			dto.deviceId,
		);

		if (device) {
			device.updateDeviceInfo({
				fcmToken: dto.fcmToken,
				deviceName: dto.deviceName,
				platform: dto.platform,
				appVersion: dto.appVersion,
			});
			await this.deviceRepository.save(device);
			this.logger.info(
				{
					userId: dto.userId,
					deviceId: dto.deviceId,
					platform: dto.platform,
					event: "DEVICE_UPDATED",
				},
				"Device token updated successfully",
			);
		} else {
			const id = this.idGenerator.generateUuid();
			device = DeviceEntity.create({
				id,
				userId: dto.userId,
				deviceId: dto.deviceId,
				fcmToken: dto.fcmToken ?? null,
				deviceName: dto.deviceName ?? null,
				platform: dto.platform,
				appVersion: dto.appVersion ?? null,
				isActive: true,
			});
			await this.deviceRepository.save(device);
			this.logger.info(
				{
					userId: dto.userId,
					deviceId: dto.deviceId,
					platform: dto.platform,
					event: "DEVICE_REGISTERED",
				},
				"Device token registered successfully",
			);
		}

		return DeviceDtoMapper.toRegisterResult(device, dto.deviceId);
	}
}
