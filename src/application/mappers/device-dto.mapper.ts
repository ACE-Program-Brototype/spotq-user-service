import type {
	CustomerDeviceResponseDto,
	RegisterDeviceResultDto,
} from "@application/dtos/device.dto.ts";
import type { DeviceEntity } from "@domain/entities/device.entity.ts";

export const DeviceDtoMapper = {
	toResponse(device: DeviceEntity): CustomerDeviceResponseDto {
		return {
			device_registration_id: device.id,
			device_id: device.deviceId ?? null,
			platform: device.platform,
			device_name: device.deviceName ?? null,
			app_version: device.appVersion ?? null,
			is_active: device.isActive,
			last_login: device.lastLogin,
			created_at: device.createdAt,
			updated_at: device.updatedAt,
		};
	},

	toResponseList(devices: DeviceEntity[]): CustomerDeviceResponseDto[] {
		return devices.map(DeviceDtoMapper.toResponse);
	},

	toRegisterResult(
		device: DeviceEntity,
		fallbackDeviceId?: string,
	): RegisterDeviceResultDto {
		return {
			deviceId: (device.deviceId ?? fallbackDeviceId) as string,
			platform: device.platform,
			isActive: device.isActive,
			deviceName: device.deviceName,
			appVersion: device.appVersion,
		};
	},
};
