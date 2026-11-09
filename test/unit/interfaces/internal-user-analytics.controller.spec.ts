import type { IGetUserAnalyticsSummaryUseCase } from "@application/ports/use-cases/internal/get-user-analytics-summary.use-case.interface.ts";
import { InternalUserAnalyticsController } from "@interfaces/http/controllers/internal/internal-user-analytics.controller.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ResponseMessage } from "@shared/constants/response-messages.constants.ts";
import type { NextFunction, Request, Response } from "express";

describe("InternalUserAnalyticsController", () => {
	let mockUseCase: jest.Mocked<IGetUserAnalyticsSummaryUseCase>;
	let controller: InternalUserAnalyticsController;
	let mockReq: Partial<Request>;
	let mockRes: {
		status: jest.Mock;
		json: jest.Mock;
	};
	let mockNext: jest.MockedFunction<NextFunction>;

	beforeEach(() => {
		mockUseCase = {
			execute: jest.fn(),
		};

		controller = new InternalUserAnalyticsController(mockUseCase);
		mockReq = {
			query: {},
		};
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		mockNext = jest.fn();
	});

	it("should call use case with parsed query and send success response", async () => {
		mockReq.query = {
			period: "month",
			month: "11",
			year: "2026",
		};

		mockUseCase.execute.mockResolvedValue({
			totalRegisteredCustomers: 12500,
			newCustomersInPeriod: 180,
		});

		await controller.getUserSummary(
			mockReq as Request,
			mockRes as unknown as Response,
			mockNext,
		);

		expect(mockUseCase.execute).toHaveBeenCalledTimes(1);
		expect(mockUseCase.execute).toHaveBeenCalledWith({
			period: "MONTH",
			month: 11,
			year: 2026,
		});
		expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
		expect(mockRes.json).toHaveBeenCalledWith({
			success: true,
			statusCode: HttpStatus.OK,
			message: ResponseMessage.USER_ANALYTICS_SUMMARY_FETCH_SUCCESS,
			data: {
				totalRegisteredCustomers: 12500,
				newCustomersInPeriod: 180,
			},
		});
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should call use case with empty query when no query params supplied", async () => {
		mockReq.query = {};
		mockUseCase.execute.mockResolvedValue({
			totalRegisteredCustomers: 12500,
			newCustomersInPeriod: 48,
		});

		await controller.getUserSummary(
			mockReq as Request,
			mockRes as unknown as Response,
			mockNext,
		);

		expect(mockUseCase.execute).toHaveBeenCalledWith({});
		expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
		expect(mockRes.json).toHaveBeenCalledWith({
			success: true,
			statusCode: HttpStatus.OK,
			message: ResponseMessage.USER_ANALYTICS_SUMMARY_FETCH_SUCCESS,
			data: {
				totalRegisteredCustomers: 12500,
				newCustomersInPeriod: 48,
			},
		});
	});

	it("should catch database/use-case failure and forward to next middleware", async () => {
		const dbError = new Error("Database query failed");
		mockUseCase.execute.mockRejectedValue(dbError);

		await controller.getUserSummary(
			mockReq as Request,
			mockRes as unknown as Response,
			mockNext,
		);

		expect(mockUseCase.execute).toHaveBeenCalledTimes(1);
		expect(mockNext).toHaveBeenCalledWith(dbError);
	});
});
