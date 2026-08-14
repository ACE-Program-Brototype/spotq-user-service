import type { DeviceEntity, PlatformType } from "../entities/device.entity.ts";

export interface IDeviceRepository {
	save(device: DeviceEntity): Promise<void>;
	findByUserIdAndPlatform(
		userId: string,
		platform: PlatformType,
	): Promise<DeviceEntity | null>;
	findById(id: string): Promise<DeviceEntity | null>;
}
