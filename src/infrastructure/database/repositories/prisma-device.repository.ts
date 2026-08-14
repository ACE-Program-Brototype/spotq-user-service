import type {
	DeviceEntity,
	PlatformType,
} from "@domain/entities/device.entity.ts";
import type { IDeviceRepository } from "@domain/repositories/device.repository.interface.ts";
import { prisma } from "@infrastructure/database/prisma/prisma.ts";
import { injectable } from "inversify";
import { DeviceMapper } from "../mappers/device.mapper.ts";

@injectable()
export class PrismaDeviceRepository implements IDeviceRepository {
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

	public async findById(id: string): Promise<DeviceEntity | null> {
		const record = await prisma.device.findUnique({
			where: { id },
		});

		return record ? DeviceMapper.toDomain(record) : null;
	}
}
