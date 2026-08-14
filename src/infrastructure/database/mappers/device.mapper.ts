import {
	DeviceEntity,
	type PlatformType,
} from "@domain/entities/device.entity.ts";
import type { Device as PrismaDeviceModel } from "@prisma/client";

export const DeviceMapper = {
	toDomain(raw: PrismaDeviceModel): DeviceEntity {
		return DeviceEntity.reconstitute({
			id: raw.id,
			userId: raw.userId,
			fcmToken: raw.fcmToken,
			deviceName: raw.deviceName,
			platform: raw.platform as PlatformType,
			lastLogin: raw.lastLogin,
		});
	},
};
