import { prisma } from "@infrastructure/database/prisma/prisma.ts";
import app from "@src/app.ts";
import request from "supertest";

jest.mock("@infrastructure/database/prisma/prisma.ts", () => ({
	prisma: {
		user: {
			findUnique: jest.fn(),
		},
	},
}));

describe("GET /admin/customers/:id - Admin Customer Details Integration Tests", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return 200 OK with customer details when requested by an admin with valid UUID", async () => {
		const validUuid = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
		const createdAt = new Date("2026-01-15T10:00:00.000Z");
		const updatedAt = new Date("2026-01-16T12:30:00.000Z");
		const mockCustomerData = {
			id: validUuid,
			fullname: "Alice Smith",
			email: "alice.smith@example.com",
			phone: "+919876543210",
			passwordHash: "hashed_pwd",
			googleId: null,
			status: "ACTIVE",
			isEmailVerified: true,
			createdAt,
			updatedAt,
			profile: {
				id: "prof-uuid-1",
				userId: validUuid,
				dob: new Date("1995-05-20T00:00:00.000Z"),
				gender: "Female",
				location: "Bangalore, India",
				createdAt,
				updatedAt,
			},
		};

		(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockCustomerData);

		const res = await request(app)
			.get(`/admin/customers/${validUuid}`)
			.set("x-user-id", "admin-uuid-1234")
			.set("x-user-role", "admin")
			.set("x-user-email", "admin@spotq.com");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			success: true,
			message: "Customer details retrieved successfully.",
			data: {
				id: validUuid,
				fullName: "Alice Smith",
				email: "alice.smith@example.com",
				phone: "+919876543210",
				status: "ACTIVE",
				isEmailVerified: true,
				location: "Bangalore, India",
				avatarUrl: null,
				createdAt: createdAt.toISOString(),
				updatedAt: updatedAt.toISOString(),
			},
			statusCode: 200,
		});

		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: validUuid },
			include: { profile: true },
		});
	});

	it("should return 401 Unauthorized when x-user-id header is missing", async () => {
		const validUuid = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

		const res = await request(app).get(`/admin/customers/${validUuid}`);

		expect(res.status).toBe(401);
		expect(res.body.success).toBe(false);
		expect(res.body.code).toBe("UNAUTHORIZED");
		expect(prisma.user.findUnique).not.toHaveBeenCalled();
	});

	it("should return 403 Forbidden when x-user-role is not admin", async () => {
		const validUuid = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

		const res = await request(app)
			.get(`/admin/customers/${validUuid}`)
			.set("x-user-id", "customer-123")
			.set("x-user-role", "customer");

		expect(res.status).toBe(403);
		expect(res.body.success).toBe(false);
		expect(res.body.code).toBe("FORBIDDEN");
		expect(prisma.user.findUnique).not.toHaveBeenCalled();
	});

	it("should return 400 Bad Request when customer ID is not a valid UUID format", async () => {
		const invalidId = "not-a-valid-uuid";

		const res = await request(app)
			.get(`/admin/customers/${invalidId}`)
			.set("x-user-id", "admin-uuid-1234")
			.set("x-user-role", "admin");

		expect(res.status).toBe(400);
		expect(res.body.success).toBe(false);
		expect(res.body.code).toBe("VALIDATION_ERROR");
		expect(res.body.message).toBe("Invalid customer ID format.");
		expect(prisma.user.findUnique).not.toHaveBeenCalled();
	});

	it("should return 404 Customer Not Found when customer does not exist in database", async () => {
		const validUuid = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

		(prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

		const res = await request(app)
			.get(`/admin/customers/${validUuid}`)
			.set("x-user-id", "admin-uuid-1234")
			.set("x-user-role", "admin");

		expect(res.status).toBe(404);
		expect(res.body).toEqual({
			success: false,
			message: "Customer not found.",
			code: "CUSTOMER_NOT_FOUND",
			error: "CUSTOMER_NOT_FOUND",
			statusCode: 404,
		});

		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: validUuid },
			include: { profile: true },
		});
	});
});
