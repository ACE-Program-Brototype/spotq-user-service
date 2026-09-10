import type { PaginatedCustomersResponseDto } from "@application/dtos/admin/list-customers.dto.ts";
import type { IListCustomersUseCase } from "@application/ports/use-cases/admin/list-customers.use-case.interface.ts";
import { UserStatus } from "@domain/entities/user.entity.ts";
import { ForbiddenError, UnauthorizedError } from "@domain/errors/index.ts";
import { CustomerAdminController } from "@interfaces/http/controllers/admin/customer-admin.controller.ts";
import type { AuthenticatedRequest } from "@interfaces/http/middlewares/auth.middleware.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ResponseMessage } from "@shared/constants/response-messages.constants.ts";
import type { Response } from "express";

describe("CustomerAdminController", () => {
	let mockListCustomersUseCase: jest.Mocked<IListCustomersUseCase>;
	let controller: CustomerAdminController;
	let mockReq: Partial<AuthenticatedRequest>;
	let mockRes: Partial<Response>;

	const mockPaginatedData: PaginatedCustomersResponseDto = {
		items: [
			{
				id: "user-123",
				fullname: "Jane Doe",
				email: "jane.doe@example.com",
				phone: "+919876543210",
				status: UserStatus.ACTIVE,
				createdAt: "2026-03-01T10:00:00.000Z",
				updatedAt: "2026-03-01T10:00:00.000Z",
			},
		],
		total: 1,
		page: 1,
		limit: 20,
		totalPages: 1,
	};

	beforeEach(() => {
		mockListCustomersUseCase = {
			execute: jest.fn().mockResolvedValue(mockPaginatedData),
		};

		controller = new CustomerAdminController(mockListCustomersUseCase);

		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
	});

	it("should return 200 and paginated customers for authenticated admin", async () => {
		mockReq = {
			user: {
				userId: "admin-123",
				email: "admin@spotq.com",
				role: "admin",
			},
			query: {
				page: "1",
				limit: "20",
			},
		};

		await controller.listCustomers(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
		);

		expect(mockListCustomersUseCase.execute).toHaveBeenCalledWith({
			page: "1",
			limit: "20",
		});
		expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
		expect(mockRes.json).toHaveBeenCalledWith({
			success: true,
			message: ResponseMessage.CUSTOMERS_FETCH_SUCCESS,
			data: mockPaginatedData,
			statusCode: HttpStatus.OK,
		});
	});

	it("should return 200 for platform admin role", async () => {
		mockReq = {
			user: {
				userId: "platform-admin-123",
				email: "platform@spotq.com",
				role: "PLATFORM_ADMIN",
			},
			query: {},
		};

		await controller.listCustomers(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
		);

		expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				data: mockPaginatedData,
			}),
		);
	});

	it("should throw UnauthorizedError when req.user or userId is missing", async () => {
		mockReq = {
			user: undefined,
			query: {},
		};

		await expect(
			controller.listCustomers(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
			),
		).rejects.toThrow(UnauthorizedError);

		expect(mockListCustomersUseCase.execute).not.toHaveBeenCalled();
	});

	it("should throw ForbiddenError when accessed with customer role", async () => {
		mockReq = {
			user: {
				userId: "user-123",
				email: "customer@example.com",
				role: "customer",
			},
			query: {},
		};

		await expect(
			controller.listCustomers(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
			),
		).rejects.toThrow(ForbiddenError);

		expect(mockListCustomersUseCase.execute).not.toHaveBeenCalled();
	});
});
