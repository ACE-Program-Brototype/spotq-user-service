import type {
	IIdGenerator,
	ILogger,
} from "@application/ports/services/index.ts";
import { RegisterDeviceUseCase } from "@application/use-cases/register-device.use-case.ts";
import { DeviceEntity } from "@domain/entities/device.entity.ts";
import type { IDeviceRepository } from "@domain/repositories/device.repository.interface.ts";

describe("RegisterDeviceUseCase", () => {
	let mockDeviceRepository: jest.Mocked<IDeviceRepository>;
	let mockIdGenerator: jest.Mocked<IIdGenerator>;
	let mockLogger: jest.Mocked<ILogger>;
	let useCase: RegisterDeviceUseCase;

	beforeEach(() => {
		mockDeviceRepository = {
			save: jest.fn().mockResolvedValue(undefined),
			findByUserIdAndDeviceId: jest.fn(),
			findByUserIdAndPlatform: jest.fn(),
			findActiveByUserId: jest.fn(),
			findByFid: jest.fn(),
			deactivate: jest.fn(),
			deactivateByFid: jest.fn(),
		} as unknown as jest.Mocked<IDeviceRepository>;

		mockIdGenerator = {
			generateUuid: jest.fn().mockReturnValue("generated-uuid-123"),
		};

		mockLogger = {
			info: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
		};

		useCase = new RegisterDeviceUseCase(
			mockDeviceRepository,
			mockIdGenerator,
			mockLogger,
		);
	});

	it("should create and register a new device when deviceId does not exist", async () => {
		mockDeviceRepository.findByUserIdAndDeviceId.mockResolvedValue(null);

		const result = await useCase.execute({
			userId: "user-123",
			deviceId: "device_abc123",
			fid: "fid_token_xyz",
			platform: "ANDROID",
			appVersion: "1.0.0",
			deviceName: "Pixel 7",
		});

		expect(result).toEqual({
			deviceId: "device_abc123",
			platform: "ANDROID",
			isActive: true,
			deviceName: "Pixel 7",
			appVersion: "1.0.0",
		});

		expect(mockDeviceRepository.save).toHaveBeenCalledTimes(1);
		const savedDevice = mockDeviceRepository.save.mock.calls[0]?.[0];
		expect(savedDevice).toBeDefined();
		expect(savedDevice?.id).toBe("generated-uuid-123");
		expect(savedDevice?.userId).toBe("user-123");
		expect(savedDevice?.deviceId).toBe("device_abc123");
		expect(savedDevice?.fid).toBe("fid_token_xyz");
		expect(savedDevice?.platform).toBe("ANDROID");
		expect(savedDevice?.isActive).toBe(true);
	});

	it("should update an existing device when customer_id + device_id exists", async () => {
		const existing = DeviceEntity.create({
			id: "existing-uuid-999",
			userId: "user-123",
			deviceId: "device_abc123",
			fid: "old_fid_token",
			deviceName: "Old Phone",
			platform: "ANDROID",
			appVersion: "0.9.0",
			isActive: false,
		});

		mockDeviceRepository.findByUserIdAndDeviceId.mockResolvedValue(existing);

		const result = await useCase.execute({
			userId: "user-123",
			deviceId: "device_abc123",
			fid: "new_refreshed_fid_token",
			platform: "ANDROID",
			appVersion: "1.0.0",
			deviceName: "Pixel 7 Updated",
		});

		expect(result).toEqual({
			deviceId: "device_abc123",
			platform: "ANDROID",
			isActive: true,
			deviceName: "Pixel 7 Updated",
			appVersion: "1.0.0",
		});

		expect(mockDeviceRepository.save).toHaveBeenCalledWith(existing);
		expect(existing.fid).toBe("new_refreshed_fid_token");
		expect(existing.isActive).toBe(true);
		expect(existing.appVersion).toBe("1.0.0");
	});

	it("should preserve existing fields when optional fields are omitted on update", async () => {
		const existing = DeviceEntity.create({
			id: "existing-uuid-999",
			userId: "user-123",
			deviceId: "device_abc123",
			fid: "existing_fid_token",
			deviceName: "Pixel 7",
			platform: "ANDROID",
			appVersion: "1.0.0",
			isActive: false,
		});

		mockDeviceRepository.findByUserIdAndDeviceId.mockResolvedValue(existing);

		const result = await useCase.execute({
			userId: "user-123",
			deviceId: "device_abc123",
			platform: "ANDROID",
		});

		expect(result).toEqual({
			deviceId: "device_abc123",
			platform: "ANDROID",
			isActive: true,
			deviceName: "Pixel 7",
			appVersion: "1.0.0",
		});

		expect(mockDeviceRepository.save).toHaveBeenCalledWith(existing);
		expect(existing.fid).toBe("existing_fid_token");
		expect(existing.deviceName).toBe("Pixel 7");
		expect(existing.appVersion).toBe("1.0.0");
		expect(existing.isActive).toBe(true);
	});
});
