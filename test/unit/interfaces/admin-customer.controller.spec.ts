import type { AdminCustomerDetailsResponseDto } from "@application/dtos/admin/admin-customer-details.dto.ts";
import type { IGetAdminCustomerDetailsUseCase } from "@application/ports/use-cases/admin/get-admin-customer-details.use-case.interface.ts";
import { AdminCustomerController } from "@interfaces/http/controllers/admin/customer.controller.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ResponseMessage } from "@shared/constants/response-messages.constants.ts";
import type { NextFunction, Request, Response } from "express";

describe("AdminCustomerController", () => {
	let mockGetAdminCustomerDetailsUseCase: jest.Mocked<IGetAdminCustomerDetailsUseCase>;
	let controller: AdminCustomerController;
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: jest.Mock;

	const mockCustomerDetails: AdminCustomerDetailsResponseDto = {
		id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		full_name: "Jane Doe",
		fullName: "Jane Doe",
		fullname: "Jane Doe",
		email: "jane.doe@example.com",
		phone: "+919876543210",
		status: "ACTIVE",
		is_email_verified: true,
		isEmailVerified: true,
		gender: "Female",
		dob: "1995-08-15",
		location: "Mumbai, India",
		avatar_url: null,
		avatarUrl: null,
		created_at: "2026-01-15T10:00:00.000Z",
		createdAt: "2026-01-15T10:00:00.000Z",
		updated_at: "2026-01-15T10:00:00.000Z",
		updatedAt: "2026-01-15T10:00:00.000Z",
	};

	beforeEach(() => {
		mockGetAdminCustomerDetailsUseCase = {
			execute: jest.fn().mockResolvedValue(mockCustomerDetails),
		};

		controller = new AdminCustomerController(
			mockGetAdminCustomerDetailsUseCase,
		);

		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		mockNext = jest.fn();
	});

	describe("getCustomerDetails", () => {
		it("should return 200 and customer details for valid request", async () => {
			mockReq = {
				params: { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" },
			};

			await controller.getCustomerDetails(
				mockReq as Request,
				mockRes as Response,
				mockNext as NextFunction,
			);

			expect(mockGetAdminCustomerDetailsUseCase.execute).toHaveBeenCalledWith(
				"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			);
			expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: ResponseMessage.ADMIN_CUSTOMER_DETAILS_FETCH_SUCCESS,
				data: mockCustomerDetails,
				statusCode: HttpStatus.OK,
			});
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should call next with error when use case throws an error", async () => {
			const error = new Error("Test error");
			mockGetAdminCustomerDetailsUseCase.execute.mockRejectedValue(error);

			mockReq = {
				params: { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" },
			};

			await controller.getCustomerDetails(
				mockReq as Request,
				mockRes as Response,
				mockNext as NextFunction,
			);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});
});
