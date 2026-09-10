import type { CustomerProfileResponseDto } from "@application/dtos/customer-profile-response.dto.ts";
import type { IGetCustomerProfileUseCase } from "@application/ports/use-cases/get-customer-profile.use-case.interface.ts";
import type { IUpdateCustomerProfileUseCase } from "@application/ports/use-cases/update-customer-profile.use-case.interface.ts";
import { ForbiddenError, UnauthorizedError } from "@domain/errors/index.ts";
import { CustomerProfileController } from "@interfaces/http/controllers/customer/customer-profile.controller.ts";
import type { AuthenticatedRequest } from "@interfaces/http/middlewares/auth.middleware.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ResponseMessage } from "@shared/constants/response-messages.constants.ts";
import type { Response } from "express";

describe("CustomerProfileController", () => {
	let mockGetCustomerProfileUseCase: jest.Mocked<IGetCustomerProfileUseCase>;
	let mockUpdateCustomerProfileUseCase: jest.Mocked<IUpdateCustomerProfileUseCase>;
	let controller: CustomerProfileController;
	let mockReq: Partial<AuthenticatedRequest>;
	let mockRes: Partial<Response>;

	const mockProfileData: CustomerProfileResponseDto = {
		id: "user-123",
		full_name: "John Doe",
		email: "john.doe@example.com",
		phone: "+919876543210",
		status: "ACTIVE",
		gender: "MALE",
		dob: "1990-01-01",
		created_at: "2026-01-15T10:00:00.000Z",
		updated_at: "2026-01-15T10:00:00.000Z",
	};

	beforeEach(() => {
		mockGetCustomerProfileUseCase = {
			execute: jest.fn().mockResolvedValue(mockProfileData),
		};

		mockUpdateCustomerProfileUseCase = {
			execute: jest.fn().mockResolvedValue(mockProfileData),
		};

		controller = new CustomerProfileController(
			mockGetCustomerProfileUseCase,
			mockUpdateCustomerProfileUseCase,
		);

		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
	});

	describe("getProfile", () => {
		it("should return 200 and profile payload for authenticated customer", async () => {
			mockReq = {
				user: {
					userId: "user-123",
					email: "john.doe@example.com",
					role: "customer",
				},
			};

			await controller.getProfile(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
			);

			expect(mockGetCustomerProfileUseCase.execute).toHaveBeenCalledWith(
				"user-123",
			);
			expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: ResponseMessage.CUSTOMER_PROFILE_FETCH_SUCCESS,
				data: mockProfileData,
				statusCode: HttpStatus.OK,
			});
		});

		it("should throw UnauthorizedError when req.user or userId is missing", async () => {
			mockReq = {
				user: undefined,
			};

			await expect(
				controller.getProfile(
					mockReq as AuthenticatedRequest,
					mockRes as Response,
				),
			).rejects.toThrow(UnauthorizedError);

			expect(mockGetCustomerProfileUseCase.execute).not.toHaveBeenCalled();
		});

		it("should throw ForbiddenError when accessed with non-customer role", async () => {
			mockReq = {
				user: {
					userId: "admin-123",
					email: "admin@spotq.com",
					role: "RESTAURANT_ADMIN",
				},
			};

			await expect(
				controller.getProfile(
					mockReq as AuthenticatedRequest,
					mockRes as Response,
				),
			).rejects.toThrow(ForbiddenError);

			expect(mockGetCustomerProfileUseCase.execute).not.toHaveBeenCalled();
		});
	});

	describe("updateProfile", () => {
		it("should return 200 and updated profile payload when update is successful", async () => {
			const updatePayload = {
				full_name: "Rahul Sharma",
				gender: "MALE" as const,
			};

			mockReq = {
				user: {
					userId: "user-123",
					email: "john.doe@example.com",
					role: "customer",
				},
				body: updatePayload,
			};

			await controller.updateProfile(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
			);

			expect(mockUpdateCustomerProfileUseCase.execute).toHaveBeenCalledWith(
				"user-123",
				updatePayload,
			);
			expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: ResponseMessage.CUSTOMER_PROFILE_UPDATE_SUCCESS,
				data: mockProfileData,
				statusCode: HttpStatus.OK,
			});
		});

		it("should throw UnauthorizedError when req.user or userId is missing on update", async () => {
			mockReq = {
				user: undefined,
				body: { full_name: "Rahul Sharma" },
			};

			await expect(
				controller.updateProfile(
					mockReq as AuthenticatedRequest,
					mockRes as Response,
				),
			).rejects.toThrow(UnauthorizedError);

			expect(mockUpdateCustomerProfileUseCase.execute).not.toHaveBeenCalled();
		});

		it("should throw ForbiddenError when update accessed with non-customer role", async () => {
			mockReq = {
				user: {
					userId: "admin-123",
					email: "admin@spotq.com",
					role: "RESTAURANT_ADMIN",
				},
				body: { full_name: "Rahul Sharma" },
			};

			await expect(
				controller.updateProfile(
					mockReq as AuthenticatedRequest,
					mockRes as Response,
				),
			).rejects.toThrow(ForbiddenError);

			expect(mockUpdateCustomerProfileUseCase.execute).not.toHaveBeenCalled();
		});
	});
});
