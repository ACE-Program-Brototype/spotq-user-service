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
	// 1. Gateway Forwarded Context (Primary - Injected by Envoy Gateway)
	const gatewayUserId = req.headers["x-user-id"] as string | undefined;
	if (gatewayUserId) {
		req.user = {
			userId: gatewayUserId,
			email: (req.headers["x-user-email"] as string | undefined) ?? "",
			role: req.headers["x-user-role"] as string | undefined,
		};
		next();
		return;
	}

	// 2. Direct Bearer Token Fallback (Standalone / Local Testing)
	const authHeader = req.headers.authorization;
	if (authHeader?.startsWith("Bearer ")) {
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
			return;
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
			return;
		}
	}

	// 3. Unauthorized when neither is present
	res
		.status(HttpStatus.UNAUTHORIZED)
		.json(
			ApiResponse.fail(
				"Authentication required.",
				HttpStatus.UNAUTHORIZED,
				"UNAUTHORIZED",
			),
		);
}
