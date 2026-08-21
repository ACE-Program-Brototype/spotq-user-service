import { container, TYPES } from "@config/di";
import type { JwtTokenService } from "@infrastructure/services/token";
import { HttpStatus, ResponseMessage } from "@shared/constants";
import { authConstants } from "@shared/constants/auth.constants";
import { AppError } from "@shared/util/app.error";
import type { NextFunction, Request, Response } from "express";

const tokenService = container.get<JwtTokenService>(TYPES.TokenService);

export const adminTempTokenCheck = async (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	try {
		const { tempToken } = req.cookies;

		if (!tempToken) {
			throw new AppError(authConstants.MISSING_TOKEN, HttpStatus.BAD_REQUEST);
		}

		let decoded: { userId: string; role: string };

		try {
			decoded = tokenService.verifyTempToken(tempToken) as {
				userId: string;
				role: string;
			};
		} catch {
			throw new AppError(authConstants.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
		}

		if (decoded.role !== "admin") {
			throw new AppError(authConstants.INVALID_USER, HttpStatus.UNAUTHORIZED);
		}

		req.userId = decoded.userId;

		next();
	} catch (error: unknown) {
		if (error instanceof AppError) {
			throw error;
		}

		// Unexpected errors should remain internal server errors.
		throw new AppError(
			ResponseMessage.INTERNAL_SERVER_ERROR,
			HttpStatus.INTERNAL_SERVER_ERROR,
		);
	}
};
