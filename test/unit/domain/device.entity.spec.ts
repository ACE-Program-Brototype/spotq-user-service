import { DeviceEntity } from "@domain/entities/device.entity.ts";

describe("DeviceEntity", () => {
	it("should create a new device entity with default lastLogin", () => {
		const device = DeviceEntity.create({
			id: "dev-1",
			userId: "usr-1",
			fcmToken: "fcm-token-123",
			deviceName: "iPhone 15",
			platform: "IOS",
		});

		expect(device.id).toBe("dev-1");
		expect(device.userId).toBe("usr-1");
		expect(device.fcmToken).toBe("fcm-token-123");
		expect(device.deviceName).toBe("iPhone 15");
		expect(device.platform).toBe("IOS");
		expect(device.lastLogin).toBeInstanceOf(Date);
	});

	it("should update FCM token and refresh lastLogin", () => {
		const device = DeviceEntity.create({
			id: "dev-1",
			userId: "usr-1",
			fcmToken: "old-token",
			deviceName: "Pixel 8",
			platform: "ANDROID",
		});

		device.updateFcmToken("new-token-456");
		expect(device.fcmToken).toBe("new-token-456");
	});

	it("should reconstitute an existing device entity", () => {
		const existingDate = new Date("2026-01-01T00:00:00Z");
		const device = DeviceEntity.reconstitute({
			id: "dev-2",
			userId: "usr-2",
			fcmToken: null,
			deviceName: null,
			platform: "WEB",
			lastLogin: existingDate,
		});

		expect(device.id).toBe("dev-2");
		expect(device.fcmToken).toBeNull();
		expect(device.deviceName).toBeNull();
		expect(device.lastLogin).toBe(existingDate);
	});
});
