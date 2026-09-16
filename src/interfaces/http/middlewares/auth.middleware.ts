import { container, TYPES } from "@config/di/index.ts";
import type { JwtTokenService } from "@infrastructure/services/token.ts";
import { authConstants } from "@shared/constants/auth.constants.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ApiResponse } from "@shared/response/api-response.model.ts";
import type { NextFunction, Request, Response } from "express";

export interface AuthenticatedUser {
	userId: string;
	email?: string;
	role?: string;
}

export interface AuthenticatedRequest extends Request {
	user?: AuthenticatedUser;
	userId?: string;
}

function getHeaderValue(
	header: string | string[] | undefined,
): string | undefined {
	if (Array.isArray(header)) {
		return header[0]?.trim();
	}
	return header?.trim();
}

export function authMiddleware(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): void {
	let userId =
		getHeaderValue(req.headers["x-user-id"]) ||
		getHeaderValue(req.headers["x-user-sub"]);
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
					sub?: string;
					userId?: string;
					role?: string;
					email?: string;
				}>(token);

				userId = decoded.sub || decoded.userId;
				role = decoded.role;
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

	req.user = {
		userId,
		email: email || "",
		role,
	};
	req.userId = userId;

	next();
}
