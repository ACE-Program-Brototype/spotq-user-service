import { DeviceEntity } from "@domain/entities/device.entity.ts";
import { prisma } from "@infrastructure/database/prisma/prisma.ts";
import { PrismaDeviceRepository } from "@infrastructure/database/repositories/prisma-device.repository.ts";

jest.mock("@infrastructure/database/prisma/prisma.ts", () => ({
	prisma: {
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

	it("should call prisma.device.upsert with mapped create and update objects in save", async () => {
		const device = DeviceEntity.reconstitute({
			id: "device-uuid-1",
			userId: "user-uuid-1",
			deviceId: "client_device_1",
			fcmToken: "fcm_token_1",
			deviceName: "Pixel 8",
			platform: "ANDROID",
			appVersion: "1.0.0",
			isActive: true,
			lastLogin: mockDate,
			createdAt: mockDate,
			updatedAt: mockDate,
		});

		(prisma.device.upsert as jest.Mock).mockResolvedValue({});

		await repository.save(device);

		expect(prisma.device.upsert).toHaveBeenCalledWith({
			where: { id: "device-uuid-1" },
			create: {
				id: "device-uuid-1",
				userId: "user-uuid-1",
				deviceId: "client_device_1",
				fcmToken: "fcm_token_1",
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
				fcmToken: "fcm_token_1",
				deviceName: "Pixel 8",
				platform: "ANDROID",
				appVersion: "1.0.0",
				isActive: true,
				lastLogin: mockDate,
				updatedAt: mockDate,
			},
		});
	});

	it("should find device by userId and deviceId", async () => {
		(prisma.device.findFirst as jest.Mock).mockResolvedValue({
			id: "device-uuid-1",
			userId: "user-uuid-1",
			deviceId: "client_device_1",
			fcmToken: "fcm_token_1",
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
