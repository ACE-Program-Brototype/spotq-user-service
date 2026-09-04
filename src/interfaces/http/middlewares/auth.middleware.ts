import type { ITokenService } from "@application/ports/services/token-service.interface.ts";
import { container } from "@config/di/container.ts";
import { TYPES } from "@config/di/types.ts";
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
}

export function authMiddleware(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): void {
	// 1. Check if user context is forwarded by API Gateway via trusted headers
	const gatewayUserId = req.headers["x-user-id"] as string | undefined;
	if (gatewayUserId) {
		req.user = {
			userId: gatewayUserId,
			email: (req.headers["x-user-email"] as string | undefined) ?? "",
			role: (req.headers["x-user-role"] as string | undefined) ?? "customer",
		};
		next();
		return;
	}

	// 2. Fallback to Bearer token verification (for direct/test calls)
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith("Bearer ")) {
		res
			.status(HttpStatus.UNAUTHORIZED)
			.json(
				ApiResponse.fail(
					"Authorization header with Bearer token or Gateway X-User-Id is required.",
					HttpStatus.UNAUTHORIZED,
					"UNAUTHORIZED",
				),
			);
		return;
	}

	const token = authHeader.split(" ")[1] ?? "";

	try {
		const tokenService = container.get<ITokenService>(TYPES.TokenService);
		const payload = tokenService.verifyAccessToken(token);

		req.user = {
			userId: payload.sub,
			email: payload.email ?? "",
			role: payload.role,
		};

		next();
	} catch (_err) {
		res
			.status(HttpStatus.UNAUTHORIZED)
			.json(
				ApiResponse.fail(
					"Invalid or expired access token.",
					HttpStatus.UNAUTHORIZED,
					"UNAUTHORIZED",
				),
			);
	}
}
