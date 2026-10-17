import { PLATFORMS } from "@domain/entities/device.entity.ts";
import { VALIDATION_MESSAGES } from "@shared/constants/index.ts";
import { z } from "zod";

export const registerDeviceSchema = z
	.object({
		device_id: z
			.string()
			.min(1, VALIDATION_MESSAGES.DEVICE.DEVICE_ID_REQUIRED)
			.max(255)
			.optional(),
		deviceId: z
			.string()
			.min(1, VALIDATION_MESSAGES.DEVICE.DEVICE_ID_REQUIRED)
			.max(255)
			.optional(),
		fid: z.string().max(500).optional().nullable(),
		platform: z.enum(PLATFORMS, {
			message: VALIDATION_MESSAGES.DEVICE.PLATFORM_INVALID,
		}),
		app_version: z.string().max(50).optional().nullable(),
		appVersion: z.string().max(50).optional().nullable(),
		device_name: z.string().max(100).optional().nullable(),
		deviceName: z.string().max(100).optional().nullable(),
	})
	.refine((data) => data.device_id || data.deviceId, {
		message: VALIDATION_MESSAGES.DEVICE.DEVICE_ID_REQUIRED,
		path: ["device_id"],
	})
	.transform((data) => ({
		deviceId: (data.device_id || data.deviceId) as string,
		fid: data.fid,
		platform: data.platform,
		appVersion:
			data.app_version !== undefined ? data.app_version : data.appVersion,
		deviceName:
			data.device_name !== undefined ? data.device_name : data.deviceName,
	}));

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;

export const deactivateDeviceParamSchema = z.object({
	deviceId: z.string().min(1, VALIDATION_MESSAGES.DEVICE.DEVICE_ID_REQUIRED),
});
