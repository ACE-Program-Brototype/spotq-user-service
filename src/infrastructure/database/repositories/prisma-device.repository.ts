import type {
	DeviceEntity,
	PlatformType,
} from "@domain/entities/device.entity.ts";
import type { IDeviceRepository } from "@domain/repositories/device.repository.interface.ts";
import { prisma } from "@infrastructure/database/prisma/prisma.ts";
import type { Device as PrismaDeviceModel } from "@prisma/client";
import { injectable } from "inversify";
import { DeviceMapper } from "../mappers/device.mapper.ts";
import {
	type IPrismaModelDelegate,
	PrismaBaseRepository,
} from "./prisma-base.repository.ts";

@injectable()
export class PrismaDeviceRepository
	extends PrismaBaseRepository<DeviceEntity, PrismaDeviceModel>
	implements IDeviceRepository
{
	constructor() {
		super(
			prisma.device as unknown as IPrismaModelDelegate<PrismaDeviceModel>,
			DeviceMapper,
		);
	}

	public async save(device: DeviceEntity): Promise<void> {
		await prisma.device.upsert({
			where: { id: device.id },
			create: DeviceMapper.toCreateInput(device),
			update: DeviceMapper.toUpdateInput(device),
		});
	}

	public async findByUserIdAndDeviceId(
		userId: string,
		deviceId: string,
	): Promise<DeviceEntity | null> {
		const record = await prisma.device.findFirst({
			where: { userId, deviceId },
		});

		return record ? DeviceMapper.toDomain(record) : null;
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

	public async findActiveByUserId(userId: string): Promise<DeviceEntity[]> {
		const records = await prisma.device.findMany({
			where: { userId, isActive: true },
		});

		return records.map(DeviceMapper.toDomain);
	}

	public async findByFcmToken(fcmToken: string): Promise<DeviceEntity | null> {
		const record = await prisma.device.findFirst({
			where: { fcmToken },
		});

		return record ? DeviceMapper.toDomain(record) : null;
	}

	public async deactivate(userId: string, deviceId: string): Promise<void> {
		await prisma.device.updateMany({
			where: { userId, deviceId },
			data: { isActive: false, updatedAt: new Date() },
		});
	}

	public async deactivateByFcmToken(fcmToken: string): Promise<void> {
		await prisma.device.updateMany({
			where: { fcmToken },
			data: { isActive: false, updatedAt: new Date() },
		});
	}
}
