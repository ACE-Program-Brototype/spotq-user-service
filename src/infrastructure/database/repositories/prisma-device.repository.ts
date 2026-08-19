import type {
	DeviceEntity,
	PlatformType,
} from "@domain/entities/device.entity.ts";
import type { IDeviceRepository } from "@domain/repositories/device.repository.interface.ts";
import { prisma } from "@infrastructure/database/prisma/prisma.ts";
import type { Device as PrismaDeviceModel } from "@prisma/client";
import { injectable } from "inversify";
import { DeviceMapper } from "../mappers/device.mapper.ts";
import { PrismaBaseRepository } from "./prisma-base.repository.ts";

@injectable()
export class PrismaDeviceRepository
	extends PrismaBaseRepository<DeviceEntity, PrismaDeviceModel>
	implements IDeviceRepository
{
	constructor() {
		super(prisma.device, DeviceMapper);
	}

	public async save(device: DeviceEntity): Promise<void> {
		await prisma.device.upsert({
			where: { id: device.id },
			create: {
				id: device.id,
				userId: device.userId,
				fcmToken: device.fcmToken,
				deviceName: device.deviceName,
				platform: device.platform,
				lastLogin: device.lastLogin,
			},
			update: {
				fcmToken: device.fcmToken,
				deviceName: device.deviceName,
				platform: device.platform,
				lastLogin: device.lastLogin,
			},
		});
	}

	public async findByUserIdAndPlatform(
		userId: string,
		platform: PlatformType,
	): Promise<DeviceEntity | null> {
		const record = await prisma.device.findFirst({
			where: { userId, platform },
		});

		return record ? DeviceMapper.toDomain(record) : null;
	}
}
