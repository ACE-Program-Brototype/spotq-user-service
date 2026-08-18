import type { Response } from "express";
import { HttpStatus } from "../constants/http.constants.ts";
import { ApiResponse } from "./api-response.model.ts";

export function sendSuccessResponse<T>(
	res: Response,
	data: T,
	message?: string,
	statusCode: number = HttpStatus.OK,
): void {
	res.status(statusCode).json(ApiResponse.ok(data, message, statusCode));
}
