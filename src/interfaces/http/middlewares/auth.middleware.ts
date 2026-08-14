import type { ITokenService } from "@application/ports/services/token-service.interface.ts";
import { container } from "@config/di/container.ts";
import { TYPES } from "@config/di/types.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ApiResponse } from "@shared/response/api-response.model.ts";
import type { NextFunction, Request, Response } from "express";

export interface AuthenticatedUser {
	userId: string;
	email: string;
}

export interface AuthenticatedRequest extends Request {
	user?: AuthenticatedUser;
}

export function authMiddleware(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): void {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith("Bearer ")) {
		res
			.status(HttpStatus.UNAUTHORIZED)
			.json(
				ApiResponse.fail(
					"Authorization header with Bearer token is required.",
					HttpStatus.UNAUTHORIZED,
					"UNAUTHORIZED",
				),
			);
		return;
	}

	const token = authHeader.split(" ")[1];

	try {
		const tokenService = container.get<ITokenService>(TYPES.TokenService);
		const payload = tokenService.verifyAccessToken(token);

		req.user = {
			userId: payload.sub,
			email: payload.email,
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
