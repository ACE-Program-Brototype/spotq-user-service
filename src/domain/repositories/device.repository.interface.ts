import type { DeviceEntity, PlatformType } from "../entities/device.entity.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface IDeviceRepository extends IBaseRepository<DeviceEntity> {
	save(device: DeviceEntity): Promise<void>;
	findByUserIdAndDeviceId(
		userId: string,
		deviceId: string,
	): Promise<DeviceEntity | null>;
	findByUserIdAndPlatform(
		userId: string,
		platform: PlatformType,
	): Promise<DeviceEntity | null>;
	findActiveByUserId(userId: string): Promise<DeviceEntity[]>;
	findByFid(fid: string): Promise<DeviceEntity | null>;
	deactivate(userId: string, deviceId: string): Promise<void>;
	deactivateByFid(fid: string): Promise<void>;
}
