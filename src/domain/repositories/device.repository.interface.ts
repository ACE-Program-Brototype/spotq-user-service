import type { DeviceEntity, PlatformType } from "../entities/device.entity.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface IDeviceRepository extends IBaseRepository<DeviceEntity> {
	save(device: DeviceEntity): Promise<void>;
	findByUserIdAndPlatform(
		userId: string,
		platform: PlatformType,
	): Promise<DeviceEntity | null>;
}
