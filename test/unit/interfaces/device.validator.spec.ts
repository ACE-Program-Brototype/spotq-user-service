import {
	deactivateDeviceParamSchema,
	registerDeviceSchema,
} from "@interfaces/http/validators/device.validator.ts";
import { VALIDATION_MESSAGES } from "@shared/constants/index.ts";

describe("registerDeviceSchema", () => {
	it("should parse valid snake_case payload from mobile client", () => {
		const result = registerDeviceSchema.safeParse({
			device_id: "device_abc123",
			fid: "FID_DEVICE_TOKEN",
			platform: "ANDROID",
			app_version: "1.0.0",
			device_name: "Pixel 7",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				deviceId: "device_abc123",
				fid: "FID_DEVICE_TOKEN",
				platform: "ANDROID",
				appVersion: "1.0.0",
				deviceName: "Pixel 7",
			});
		}
	});

	it("should parse valid camelCase payload", () => {
		const result = registerDeviceSchema.safeParse({
			deviceId: "device_abc123",
			fid: "FID_DEVICE_TOKEN",
			platform: "IOS",
			appVersion: "2.1.0",
			deviceName: "iPhone 15 Pro",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				deviceId: "device_abc123",
				fid: "FID_DEVICE_TOKEN",
				platform: "IOS",
				appVersion: "2.1.0",
				deviceName: "iPhone 15 Pro",
			});
		}
	});

	it("should fail when device_id / deviceId is missing with constant error message", () => {
		const result = registerDeviceSchema.safeParse({
			fid: "FID_DEVICE_TOKEN",
			platform: "ANDROID",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.DEVICE.DEVICE_ID_REQUIRED,
			);
		}
	});

	it("should fail when platform is invalid with constant error message", () => {
		const result = registerDeviceSchema.safeParse({
			device_id: "device_abc123",
			platform: "WINDOWS",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.DEVICE.PLATFORM_INVALID,
			);
		}
	});
});

describe("deactivateDeviceParamSchema", () => {
	it("should pass for valid deviceId param", () => {
		const result = deactivateDeviceParamSchema.safeParse({
			deviceId: "device_abc123",
		});

		expect(result.success).toBe(true);
	});

	it("should fail for empty deviceId param with constant error message", () => {
		const result = deactivateDeviceParamSchema.safeParse({
			deviceId: "",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				VALIDATION_MESSAGES.DEVICE.DEVICE_ID_REQUIRED,
			);
		}
	});
});
