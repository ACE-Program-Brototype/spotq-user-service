import {
	DeviceEntity,
	type PlatformType,
} from "@domain/entities/device.entity.ts";
import type { Prisma, Device as PrismaDeviceModel } from "@prisma/client";

export const DeviceMapper = {
	toDomain(raw: PrismaDeviceModel): DeviceEntity {
		return DeviceEntity.reconstitute({
			id: raw.id,
			userId: raw.userId,
			deviceId: raw.deviceId,
			fid: raw.fid,
			deviceName: raw.deviceName,
			platform: raw.platform as PlatformType,
			appVersion: raw.appVersion,
			isActive: raw.isActive,
			lastLogin: raw.lastLogin,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		});
	},

	toPersistence(entity: DeviceEntity): PrismaDeviceModel {
		return {
			id: entity.id,
			userId: entity.userId,
			deviceId: entity.deviceId ?? null,
			fid: entity.fid ?? null,
			deviceName: entity.deviceName ?? null,
			platform: entity.platform,
			appVersion: entity.appVersion ?? null,
			isActive: entity.isActive,
			lastLogin: entity.lastLogin,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	},

	toCreateInput(entity: DeviceEntity): Prisma.DeviceUncheckedCreateInput {
		return DeviceMapper.toPersistence(entity);
	},

	toUpdateInput(entity: DeviceEntity): Prisma.DeviceUncheckedUpdateInput {
		return {
			deviceId: entity.deviceId ?? null,
			fid: entity.fid ?? null,
			deviceName: entity.deviceName ?? null,
			platform: entity.platform,
			appVersion: entity.appVersion ?? null,
			isActive: entity.isActive,
			lastLogin: entity.lastLogin,
			updatedAt: entity.updatedAt,
		};
	},
};
