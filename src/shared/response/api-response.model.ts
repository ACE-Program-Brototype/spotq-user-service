import { HttpStatus } from "@shared/constants";
import type { Response } from "express";

export interface ApiResponseBody<T> {
	success: boolean;
	message?: string;
	data?: T;
	code?: string;
	statusCode: number;
}

export const ApiResponse = {
	ok<T>(
		data: T,
		message = "Success",
		statusCode = HttpStatus.OK,
	): ApiResponseBody<T> {
		return { success: true, message, data, statusCode };
	},

	fail(
		message: string,
		statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
		code?: string,
	): ApiResponseBody<never> {
		return { success: false, message, code, statusCode };
	},
};
export const successResponse = <T>(
	res: Response,
	data: T,
	message: string = "Success",
	statusCode: number = HttpStatus.OK,
) => {
	return res.status(statusCode).json(ApiResponse.ok(data, message, statusCode));
};
