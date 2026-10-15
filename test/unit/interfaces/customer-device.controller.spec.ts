import type { IDeactivateDeviceUseCase } from "@application/ports/use-cases/deactivate-device.use-case.interface.ts";
import type { IGetCustomerDevicesUseCase } from "@application/ports/use-cases/get-customer-devices.use-case.interface.ts";
import type { IRegisterDeviceUseCase } from "@application/ports/use-cases/register-device.use-case.interface.ts";
import { UnauthorizedError } from "@domain/errors/index.ts";
import { CustomerDeviceController } from "@interfaces/http/controllers/customer/customer-device.controller.ts";
import type { AuthenticatedRequest } from "@interfaces/http/middlewares/auth.middleware.ts";
import type { Response } from "express";

describe("CustomerDeviceController", () => {
	let mockRegisterDeviceUseCase: jest.Mocked<IRegisterDeviceUseCase>;
	let mockGetCustomerDevicesUseCase: jest.Mocked<IGetCustomerDevicesUseCase>;
	let mockDeactivateDeviceUseCase: jest.Mocked<IDeactivateDeviceUseCase>;
	let controller: CustomerDeviceController;
	let mockResponse: Partial<Response>;

	beforeEach(() => {
		mockRegisterDeviceUseCase = {
			execute: jest.fn(),
		};
		mockGetCustomerDevicesUseCase = {
			execute: jest.fn(),
		};
		mockDeactivateDeviceUseCase = {
			execute: jest.fn(),
		};

		controller = new CustomerDeviceController(
			mockRegisterDeviceUseCase,
			mockGetCustomerDevicesUseCase,
			mockDeactivateDeviceUseCase,
		);

		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
	});

	it("should throw UnauthorizedError when user is not present in request", async () => {
		const req = { user: undefined, body: {} } as AuthenticatedRequest;

		await expect(
			controller.registerDevice(req, mockResponse as Response),
		).rejects.toThrow(UnauthorizedError);
	});

	it("should register device and return success response format as specified in Jira", async () => {
		const req = {
			user: { userId: "user-123" },
			body: {
				deviceId: "device_abc123",
				fid: "token_123",
				platform: "ANDROID",
				appVersion: "1.0.0",
				deviceName: "Pixel 7",
			},
		} as unknown as AuthenticatedRequest;

		mockRegisterDeviceUseCase.execute.mockResolvedValue({
			deviceId: "device_abc123",
			platform: "ANDROID",
			isActive: true,
			deviceName: "Pixel 7",
			appVersion: "1.0.0",
		});

		await controller.registerDevice(req, mockResponse as Response);

		expect(mockRegisterDeviceUseCase.execute).toHaveBeenCalledWith({
			userId: "user-123",
			deviceId: "device_abc123",
			fid: "token_123",
			platform: "ANDROID",
			appVersion: "1.0.0",
			deviceName: "Pixel 7",
		});

		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: "Device registered successfully",
				data: {
					device_id: "device_abc123",
					platform: "ANDROID",
					is_active: true,
				},
			}),
		);
	});

	it("should get customer devices", async () => {
		const req = {
			user: { userId: "user-123" },
		} as AuthenticatedRequest;

		mockGetCustomerDevicesUseCase.execute.mockResolvedValue([
			{
				deviceRegistrationId: "id-1",
				deviceId: "device_abc123",
				platform: "ANDROID",
				deviceName: "Pixel 7",
				appVersion: "1.0.0",
				isActive: true,
				lastLogin: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);

		await controller.getDevices(req, mockResponse as Response);

		expect(mockGetCustomerDevicesUseCase.execute).toHaveBeenCalledWith(
			"user-123",
		);
		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});

	it("should deactivate customer device", async () => {
		const req = {
			user: { userId: "user-123" },
			params: { deviceId: "device_abc123" },
		} as unknown as AuthenticatedRequest;

		await controller.deactivateDevice(req, mockResponse as Response);

		expect(mockDeactivateDeviceUseCase.execute).toHaveBeenCalledWith({
			userId: "user-123",
			deviceId: "device_abc123",
		});
		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});
