import { DeviceEntity } from "@domain/entities/device.entity.ts";
import { DeviceMapper } from "@infrastructure/database/mappers/device.mapper.ts";
import type { Device as PrismaDeviceModel } from "@prisma/client";

describe("DeviceMapper", () => {
	const mockDate = new Date("2026-10-15T10:00:00.000Z");

	const mockPrismaDevice: PrismaDeviceModel = {
		id: "device-uuid-1",
		userId: "user-uuid-1",
		deviceId: "client_device_1",
		fid: "fid_token_1",
		deviceName: "Pixel 8",
		platform: "ANDROID",
		appVersion: "1.0.0",
		isActive: true,
		lastLogin: mockDate,
		createdAt: mockDate,
		updatedAt: mockDate,
	};

	it("should map from Prisma model to domain DeviceEntity", () => {
		const entity = DeviceMapper.toDomain(mockPrismaDevice);

		expect(entity).toBeInstanceOf(DeviceEntity);
		expect(entity.id).toBe("device-uuid-1");
		expect(entity.userId).toBe("user-uuid-1");
		expect(entity.deviceId).toBe("client_device_1");
		expect(entity.fid).toBe("fid_token_1");
		expect(entity.deviceName).toBe("Pixel 8");
		expect(entity.platform).toBe("ANDROID");
		expect(entity.appVersion).toBe("1.0.0");
		expect(entity.isActive).toBe(true);
		expect(entity.lastLogin).toEqual(mockDate);
		expect(entity.createdAt).toEqual(mockDate);
		expect(entity.updatedAt).toEqual(mockDate);
	});

	it("should map from domain DeviceEntity to persistence PrismaDeviceModel", () => {
		const entity = DeviceEntity.reconstitute({
			id: "device-uuid-1",
			userId: "user-uuid-1",
			deviceId: "client_device_1",
			fid: "fid_token_1",
			deviceName: "Pixel 8",
			platform: "ANDROID",
			appVersion: "1.0.0",
			isActive: true,
			lastLogin: mockDate,
			createdAt: mockDate,
			updatedAt: mockDate,
		});

		const raw = DeviceMapper.toPersistence(entity);

		expect(raw).toEqual(mockPrismaDevice);
	});

	it("should map toCreateInput identically to toPersistence", () => {
		const entity = DeviceEntity.reconstitute({
			id: "device-uuid-1",
			userId: "user-uuid-1",
			deviceId: "client_device_1",
			fid: "fid_token_1",
			deviceName: "Pixel 8",
			platform: "ANDROID",
			appVersion: "1.0.0",
			isActive: true,
			lastLogin: mockDate,
			createdAt: mockDate,
			updatedAt: mockDate,
		});

		const createInput = DeviceMapper.toCreateInput(entity);

		expect(createInput).toEqual(mockPrismaDevice);
	});

	it("should map toUpdateInput excluding immutable fields (id, userId, createdAt)", () => {
		const entity = DeviceEntity.reconstitute({
			id: "device-uuid-1",
			userId: "user-uuid-1",
			deviceId: "client_device_1",
			fid: "fid_token_1",
			deviceName: "Pixel 8",
			platform: "ANDROID",
			appVersion: "1.0.0",
			isActive: true,
			lastLogin: mockDate,
			createdAt: mockDate,
			updatedAt: mockDate,
		});

		const updateInput = DeviceMapper.toUpdateInput(entity);

		expect(updateInput).toEqual({
			deviceId: "client_device_1",
			fid: "fid_token_1",
			deviceName: "Pixel 8",
			platform: "ANDROID",
			appVersion: "1.0.0",
			isActive: true,
			lastLogin: mockDate,
			updatedAt: mockDate,
		});
		expect(updateInput).not.toHaveProperty("id");
		expect(updateInput).not.toHaveProperty("userId");
		expect(updateInput).not.toHaveProperty("createdAt");
	});
});
