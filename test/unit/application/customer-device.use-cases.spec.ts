import type { ILogger } from "@application/ports/services/index.ts";
import { DeactivateDeviceUseCase } from "@application/use-cases/deactivate-device.use-case.ts";
import { GetCustomerDevicesUseCase } from "@application/use-cases/get-customer-devices.use-case.ts";
import { DeviceEntity } from "@domain/entities/device.entity.ts";
import type { IDeviceRepository } from "@domain/repositories/device.repository.interface.ts";

describe("GetCustomerDevicesUseCase & DeactivateDeviceUseCase", () => {
	let mockDeviceRepository: jest.Mocked<IDeviceRepository>;
	let mockLogger: jest.Mocked<ILogger>;

	beforeEach(() => {
		mockDeviceRepository = {
			save: jest.fn(),
			findByUserIdAndDeviceId: jest.fn(),
			findByUserIdAndPlatform: jest.fn(),
			findActiveByUserId: jest.fn(),
			findByFcmToken: jest.fn(),
			deactivate: jest.fn().mockResolvedValue(undefined),
			deactivateByFcmToken: jest.fn().mockResolvedValue(undefined),
		} as unknown as jest.Mocked<IDeviceRepository>;

		mockLogger = {
			info: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
		};
	});

	describe("GetCustomerDevicesUseCase", () => {
		it("should return active devices for a customer", async () => {
			const dev1 = DeviceEntity.create({
				id: "id-1",
				userId: "usr-1",
				deviceId: "device_1",
				fcmToken: "token_1",
				platform: "ANDROID",
				deviceName: "Galaxy S23",
				appVersion: "1.0",
			});
			const dev2 = DeviceEntity.create({
				id: "id-2",
				userId: "usr-1",
				deviceId: "device_2",
				fcmToken: "token_2",
				platform: "IOS",
				deviceName: "iPhone 15",
				appVersion: "1.0",
			});

			mockDeviceRepository.findActiveByUserId.mockResolvedValue([dev1, dev2]);

			const useCase = new GetCustomerDevicesUseCase(mockDeviceRepository);
			const result = await useCase.execute("usr-1");

			expect(result).toHaveLength(2);
			expect(result[0]?.deviceId).toBe("device_1");
			expect(result[0]?.platform).toBe("ANDROID");
			expect(result[1]?.deviceId).toBe("device_2");
			expect(result[1]?.platform).toBe("IOS");
			expect(mockDeviceRepository.findActiveByUserId).toHaveBeenCalledWith(
				"usr-1",
			);
		});
	});

	describe("DeactivateDeviceUseCase", () => {
		it("should deactivate device by userId and deviceId", async () => {
			const useCase = new DeactivateDeviceUseCase(
				mockDeviceRepository,
				mockLogger,
			);

			await useCase.execute({
				userId: "usr-1",
				deviceId: "device_abc",
			});

			expect(mockDeviceRepository.deactivate).toHaveBeenCalledWith(
				"usr-1",
				"device_abc",
			);
		});

		it("should deactivate device by fcmToken", async () => {
			const useCase = new DeactivateDeviceUseCase(
				mockDeviceRepository,
				mockLogger,
			);

			await useCase.execute({
				userId: "usr-1",
				fcmToken: "invalid_fcm_token_123",
			});

			expect(mockDeviceRepository.deactivateByFcmToken).toHaveBeenCalledWith(
				"invalid_fcm_token_123",
			);
		});
	});
});
