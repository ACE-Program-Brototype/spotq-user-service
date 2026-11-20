import { DeviceEntity } from "@domain/entities/device.entity.ts";
import { prisma } from "@infrastructure/database/prisma/prisma.ts";
import { PrismaDeviceRepository } from "@infrastructure/database/repositories/prisma-device.repository.ts";

jest.mock("@infrastructure/database/prisma/prisma.ts", () => ({
	prisma: {
		$transaction: jest.fn(),
		device: {
			upsert: jest.fn(),
			findFirst: jest.fn(),
			findMany: jest.fn(),
			updateMany: jest.fn(),
		},
	},
}));

describe("PrismaDeviceRepository", () => {
	let repository: PrismaDeviceRepository;
	const mockDate = new Date("2026-10-15T12:00:00.000Z");

	beforeEach(() => {
		jest.clearAllMocks();
		repository = new PrismaDeviceRepository();
	});

	it("should deactivate other records matching deviceId or fid and upsert within transaction in save", async () => {
		const device = DeviceEntity.reconstitute({
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

		const mockTx = {
			device: {
				upsert: jest.fn().mockResolvedValue({}),
				updateMany: jest.fn().mockResolvedValue({ count: 1 }),
			},
		};

		(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
			return callback(mockTx);
		});

		await repository.save(device);

		expect(prisma.$transaction).toHaveBeenCalledTimes(1);
		expect(mockTx.device.updateMany).toHaveBeenCalledWith({
			where: {
				id: { not: "device-uuid-1" },
				isActive: true,
				OR: [{ deviceId: "client_device_1" }, { fid: "fid_token_1" }],
			},
			data: expect.objectContaining({
				isActive: false,
			}),
		});

		expect(mockTx.device.upsert).toHaveBeenCalledWith({
			where: {
				userId_deviceId: {
					userId: "user-uuid-1",
					deviceId: "client_device_1",
				},
			},
			create: {
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
			},
			update: {
				deviceId: "client_device_1",
				fid: "fid_token_1",
				deviceName: "Pixel 8",
				platform: "ANDROID",
				appVersion: "1.0.0",
				isActive: true,
				lastLogin: mockDate,
				updatedAt: mockDate,
			},
		});
	});

	it("should skip deactivating other records if deviceId and fid are absent in save", async () => {
		const device = DeviceEntity.reconstitute({
			id: "device-uuid-2",
			userId: "user-uuid-2",
			deviceName: "Browser",
			platform: "WEB",
			isActive: true,
			lastLogin: mockDate,
			createdAt: mockDate,
			updatedAt: mockDate,
		});

		const mockTx = {
			device: {
				upsert: jest.fn().mockResolvedValue({}),
				updateMany: jest.fn().mockResolvedValue({ count: 0 }),
			},
		};

		(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
			return callback(mockTx);
		});

		await repository.save(device);

		expect(mockTx.device.updateMany).not.toHaveBeenCalled();
		expect(mockTx.device.upsert).toHaveBeenCalledWith({
			where: { id: "device-uuid-2" },
			create: expect.objectContaining({
				id: "device-uuid-2",
				userId: "user-uuid-2",
			}),
			update: expect.objectContaining({
				isActive: true,
			}),
		});
	});

	it("should find device by userId and deviceId", async () => {
		(prisma.device.findFirst as jest.Mock).mockResolvedValue({
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

		const result = await repository.findByUserIdAndDeviceId(
			"user-uuid-1",
			"client_device_1",
		);

		expect(result).toBeInstanceOf(DeviceEntity);
		expect(result?.deviceId).toBe("client_device_1");
	});

	it("should deactivate device by userId and deviceId", async () => {
		(prisma.device.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

		await repository.deactivate("user-uuid-1", "client_device_1");

		expect(prisma.device.updateMany).toHaveBeenCalledWith({
			where: { userId: "user-uuid-1", deviceId: "client_device_1" },
			data: expect.objectContaining({ isActive: false }),
		});
	});
});
