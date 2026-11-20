import { DeviceDtoMapper } from "@application/mappers/device-dto.mapper.ts";
import { DeviceEntity } from "@domain/entities/device.entity.ts";

describe("DeviceDtoMapper", () => {
	const mockDate = new Date("2026-10-15T12:00:00.000Z");

	it("should map DeviceEntity to CustomerDeviceResponseDto", () => {
		const device = DeviceEntity.reconstitute({
			id: "device-uuid-1",
			userId: "user-uuid-1",
			deviceId: "client_device_123",
			fid: "fid_token_123",
			deviceName: "Pixel 8",
			platform: "ANDROID",
			appVersion: "1.0.0",
			isActive: true,
			lastLogin: mockDate,
			createdAt: mockDate,
			updatedAt: mockDate,
		});

		const result = DeviceDtoMapper.toResponse(device);

		expect(result).toEqual({
			device_registration_id: "device-uuid-1",
			device_id: "client_device_123",
			platform: "ANDROID",
			device_name: "Pixel 8",
			app_version: "1.0.0",
			is_active: true,
			last_login: mockDate,
			created_at: mockDate,
			updated_at: mockDate,
		});
	});

	it("should map a list of DeviceEntity objects", () => {
		const device1 = DeviceEntity.reconstitute({
			id: "device-uuid-1",
			userId: "user-uuid-1",
			deviceId: "client_device_1",
			fid: "fid_1",
			deviceName: "Pixel 8",
			platform: "ANDROID",
			appVersion: "1.0.0",
			isActive: true,
			lastLogin: mockDate,
			createdAt: mockDate,
			updatedAt: mockDate,
		});

		const device2 = DeviceEntity.reconstitute({
			id: "device-uuid-2",
			userId: "user-uuid-1",
			deviceId: "client_device_2",
			fid: "fid_2",
			deviceName: "iPhone 15",
			platform: "IOS",
			appVersion: "2.0.0",
			isActive: false,
			lastLogin: mockDate,
			createdAt: mockDate,
			updatedAt: mockDate,
		});

		const results = DeviceDtoMapper.toResponseList([device1, device2]);

		expect(results).toHaveLength(2);
		expect(results[0]?.device_id).toBe("client_device_1");
		expect(results[1]?.device_id).toBe("client_device_2");
	});

	it("should map DeviceEntity to RegisterDeviceResultDto", () => {
		const device = DeviceEntity.reconstitute({
			id: "device-uuid-1",
			userId: "user-uuid-1",
			deviceId: "client_device_123",
			fid: "fid_token_123",
			deviceName: "Pixel 8",
			platform: "ANDROID",
			appVersion: "1.0.0",
			isActive: true,
			lastLogin: mockDate,
			createdAt: mockDate,
			updatedAt: mockDate,
		});

		const result = DeviceDtoMapper.toRegisterResult(device);

		expect(result).toEqual({
			deviceId: "client_device_123",
			platform: "ANDROID",
			isActive: true,
			deviceName: "Pixel 8",
			appVersion: "1.0.0",
		});
	});

	it("should map with fallback deviceId when device.deviceId is null", () => {
		const device = DeviceEntity.reconstitute({
			id: "device-uuid-1",
			userId: "user-uuid-1",
			deviceId: null,
			fid: "fid_token_123",
			deviceName: null,
			platform: "IOS",
			appVersion: null,
			isActive: true,
			lastLogin: mockDate,
			createdAt: mockDate,
			updatedAt: mockDate,
		});

		const result = DeviceDtoMapper.toRegisterResult(
			device,
			"fallback_device_456",
		);

		expect(result).toEqual({
			deviceId: "fallback_device_456",
			platform: "IOS",
			isActive: true,
			deviceName: null,
			appVersion: null,
		});
	});
});
