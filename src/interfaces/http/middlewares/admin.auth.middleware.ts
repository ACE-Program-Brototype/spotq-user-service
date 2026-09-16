import { container, TYPES } from "@config/di";
import type { JwtTokenService } from "@infrastructure/services/token";
import { HttpStatus, ResponseMessage } from "@shared/constants";
import { authConstants } from "@shared/constants/auth.constants";
import { ApiResponse } from "@shared/response/api-response.model.ts";
import { AppError } from "@shared/util/app.error";
import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "./auth.middleware.ts";

function getHeaderValue(
	header: string | string[] | undefined,
): string | undefined {
	if (Array.isArray(header)) {
		return header[0]?.trim();
	}
	return header?.trim();
}

export function adminAuthMiddleware(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): void {
	let userId = getHeaderValue(req.headers["x-user-id"]);
	let role = getHeaderValue(req.headers["x-user-role"]);
	let email = getHeaderValue(req.headers["x-user-email"]);

	if (!userId) {
		const authHeader = req.headers.authorization;
		if (authHeader?.startsWith("Bearer ")) {
			const token = authHeader.substring(7).trim();
			try {
				const tokenService = container.get<JwtTokenService>(
					TYPES.TokenServices,
				);
				const decoded = tokenService.verifyAccessToken<{
					userId?: string;
					role?: string;
					email?: string;
				}>(token);

				userId = decoded.userId;
				role = decoded.role || "admin";
				email = decoded.email;
			} catch {
				// Invalid token fallback handled by userId check below
			}
		}
	}

	if (!userId) {
		res
			.status(HttpStatus.UNAUTHORIZED)
			.json(
				ApiResponse.fail(
					authConstants.GATEWAY_UNAUTHORIZED,
					HttpStatus.UNAUTHORIZED,
					"UNAUTHORIZED",
				),
			);
		return;
	}

	if (role !== "admin") {
		res
			.status(HttpStatus.FORBIDDEN)
			.json(
				ApiResponse.fail(
					authConstants.ADMIN_FORBIDDEN,
					HttpStatus.FORBIDDEN,
					"FORBIDDEN",
				),
			);
		return;
	}

	req.user = {
		userId,
		email: email || "",
		role: role || "admin",
	};
	req.userId = userId;

	next();
}

export const adminAuth = adminAuthMiddleware;

export const adminTempTokenCheck = async (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	try {
		const tokenService = container.get<JwtTokenService>(TYPES.TokenServices);
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

		throw new AppError(
			ResponseMessage.INTERNAL_SERVER_ERROR,
			HttpStatus.INTERNAL_SERVER_ERROR,
		);
	}
};
