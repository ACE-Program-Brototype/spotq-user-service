import request from "supertest";
import app from "../../src/app.ts";
import { prisma } from "../../src/infrastructure/database/prisma/prisma.ts";

describe("Customer Device Token Management API (SCRUM-1657)", () => {
	const customerId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("POST /me/devices", () => {
		it("should return 401 Unauthorized when no authentication is provided", async () => {
			const res = await request(app).post("/me/devices").send({
				device_id: "device_abc123",
				fid: "fid_test_token",
				platform: "ANDROID",
			});

			expect(res.status).toBe(401);
		});

		it("should return 422 when device_id is missing", async () => {
			const res = await request(app)
				.post("/me/devices")
				.set("x-user-id", customerId)
				.set("x-user-role", "customer")
				.send({
					fid: "fid_test_token",
					platform: "ANDROID",
				});

			expect(res.status).toBe(422);
			expect(res.body.success).toBe(false);
		});

		it("should return 422 when platform is invalid", async () => {
			const res = await request(app)
				.post("/me/devices")
				.set("x-user-id", customerId)
				.set("x-user-role", "customer")
				.send({
					device_id: "device_abc123",
					platform: "WINDOWS",
				});

			expect(res.status).toBe(422);
			expect(res.body.success).toBe(false);
		});

		it("should register/update device and return Jira specified format on POST /me/devices", async () => {
			jest
				.spyOn(prisma, "$transaction")
				.mockImplementation(async (callback: unknown) => {
					if (typeof callback === "function") {
						return (callback as (tx: unknown) => Promise<unknown>)(prisma);
					}
					return Promise.resolve(callback);
				});
			jest.spyOn(prisma.device, "findFirst").mockResolvedValue(null);
			jest.spyOn(prisma.device, "updateMany").mockResolvedValue({ count: 0 });
			jest.spyOn(prisma.device, "upsert").mockResolvedValue({
				id: "99999999-9999-9999-9999-999999999999",
				userId: customerId,
				deviceId: "device_abc123",
				fid: "FID_DEVICE_TOKEN",
				deviceName: "Pixel 7",
				platform: "ANDROID",
				appVersion: "1.0.0",
				isActive: true,
				lastLogin: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const res = await request(app)
				.post("/me/devices")
				.set("x-user-id", customerId)
				.set("x-user-role", "customer")
				.send({
					device_id: "device_abc123",
					fid: "FID_DEVICE_TOKEN",
					platform: "ANDROID",
					app_version: "1.0.0",
					device_name: "Pixel 7",
				});

			expect(res.status).toBe(200);
			expect(res.body).toEqual({
				success: true,
				statusCode: 200,
				message: "Device registered successfully",
				data: {
					device_id: "device_abc123",
					platform: "ANDROID",
					is_active: true,
				},
			});
		});
	});

	describe("GET /me/devices", () => {
		it("should return active devices list for customer", async () => {
			jest.spyOn(prisma.device, "findMany").mockResolvedValue([
				{
					id: "99999999-9999-9999-9999-999999999999",
					userId: customerId,
					deviceId: "device_1",
					fid: "token_1",
					deviceName: "Pixel 7",
					platform: "ANDROID",
					appVersion: "1.0.0",
					isActive: true,
					lastLogin: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]);

			const res = await request(app)
				.get("/me/devices")
				.set("x-user-id", customerId)
				.set("x-user-role", "customer");

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.data).toHaveLength(1);
			expect(res.body.data[0].deviceId).toBe("device_1");
			expect(res.body.data[0].deviceRegistrationId).toBe(
				"99999999-9999-9999-9999-999999999999",
			);
		});
	});

	describe("DELETE /me/devices/:deviceId", () => {
		it("should deactivate customer device", async () => {
			const updateSpy = jest
				.spyOn(prisma.device, "updateMany")
				.mockResolvedValue({ count: 1 });

			const res = await request(app)
				.delete("/me/devices/device_abc123")
				.set("x-user-id", customerId)
				.set("x-user-role", "customer");

			expect(res.status).toBe(200);
			expect(res.body.message).toBe("Device deactivated successfully");
			expect(updateSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						userId: customerId,
						deviceId: "device_abc123",
					},
					data: expect.objectContaining({
						isActive: false,
					}),
				}),
			);
		});
	});
});
