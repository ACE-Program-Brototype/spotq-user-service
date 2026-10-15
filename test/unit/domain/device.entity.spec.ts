import { DeviceEntity } from "@domain/entities/device.entity.ts";

describe("DeviceEntity", () => {
	it("should create a new device entity with default lastLogin", () => {
		const device = DeviceEntity.create({
			id: "dev-1",
			userId: "usr-1",
			fid: "fid-token-123",
			deviceName: "iPhone 15",
			platform: "IOS",
		});

		expect(device.id).toBe("dev-1");
		expect(device.userId).toBe("usr-1");
		expect(device.fid).toBe("fid-token-123");
		expect(device.deviceName).toBe("iPhone 15");
		expect(device.platform).toBe("IOS");
		expect(device.isActive).toBe(true);
		expect(device.lastLogin).toBeInstanceOf(Date);
		expect(device.createdAt).toBeInstanceOf(Date);
		expect(device.updatedAt).toBeInstanceOf(Date);
	});

	it("should create a device entity with deviceId and appVersion", () => {
		const device = DeviceEntity.create({
			id: "dev-uuid-1",
			userId: "usr-1",
			deviceId: "device_abc123",
			fid: "fid-token-abc",
			deviceName: "Pixel 7",
			platform: "ANDROID",
			appVersion: "1.0.0",
		});

		expect(device.deviceId).toBe("device_abc123");
		expect(device.appVersion).toBe("1.0.0");
		expect(device.isActive).toBe(true);
	});

	it("should update FID and refresh lastLogin and isActive", () => {
		const device = DeviceEntity.create({
			id: "dev-1",
			userId: "usr-1",
			deviceId: "device-1",
			fid: "old-token",
			deviceName: "Pixel 8",
			platform: "ANDROID",
		});

		device.deactivate();
		expect(device.isActive).toBe(false);

		device.updateFid("new-token-456");
		expect(device.fid).toBe("new-token-456");
		expect(device.isActive).toBe(true);
	});

	it("should update device info and reactivate device", () => {
		const device = DeviceEntity.create({
			id: "dev-1",
			userId: "usr-1",
			deviceId: "device-1",
			fid: "old-token",
			deviceName: "Old Phone",
			platform: "ANDROID",
		});

		device.deactivate();
		expect(device.isActive).toBe(false);

		device.updateDeviceInfo({
			fid: "refreshed-fid-token",
			deviceName: "New Phone",
			platform: "ANDROID",
			appVersion: "2.0.0",
		});

		expect(device.fid).toBe("refreshed-fid-token");
		expect(device.deviceName).toBe("New Phone");
		expect(device.appVersion).toBe("2.0.0");
		expect(device.isActive).toBe(true);
	});

	it("should deactivate and activate explicitly", () => {
		const device = DeviceEntity.create({
			id: "dev-1",
			userId: "usr-1",
			platform: "WEB",
		});

		expect(device.isActive).toBe(true);
		device.deactivate();
		expect(device.isActive).toBe(false);
		device.activate();
		expect(device.isActive).toBe(true);
	});

	it("should reconstitute an existing device entity", () => {
		const existingDate = new Date("2026-01-01T00:00:00Z");
		const device = DeviceEntity.reconstitute({
			id: "dev-2",
			userId: "usr-2",
			deviceId: "device_xyz",
			fid: null,
			deviceName: null,
			platform: "WEB",
			appVersion: "1.2.3",
			isActive: true,
			lastLogin: existingDate,
			createdAt: existingDate,
			updatedAt: existingDate,
		});

		expect(device.id).toBe("dev-2");
		expect(device.deviceId).toBe("device_xyz");
		expect(device.fid).toBeNull();
		expect(device.deviceName).toBeNull();
		expect(device.appVersion).toBe("1.2.3");
		expect(device.isActive).toBe(true);
		expect(device.lastLogin).toBe(existingDate);
		expect(device.createdAt).toBe(existingDate);
		expect(device.updatedAt).toBe(existingDate);
	});
});
