import type {
	CustomerDeviceResponseDto,
	RegisterDeviceResultDto,
} from "@application/dtos/device.dto.ts";
import type { DeviceEntity } from "@domain/entities/device.entity.ts";

export const DeviceDtoMapper = {
	toResponse(device: DeviceEntity): CustomerDeviceResponseDto {
		return {
			deviceRegistrationId: device.id,
			deviceId: device.deviceId ?? null,
			platform: device.platform,
			deviceName: device.deviceName ?? null,
			appVersion: device.appVersion ?? null,
			isActive: device.isActive,
			lastLogin: device.lastLogin,
			createdAt: device.createdAt,
			updatedAt: device.updatedAt,
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
