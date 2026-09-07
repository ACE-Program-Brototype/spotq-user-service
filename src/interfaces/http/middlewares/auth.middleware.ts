import type { ITokenService } from "@application/ports/services/token-service.interface.ts";
import { container } from "@config/di/container.ts";
import { TYPES } from "@config/di/types.ts";
import { authConstants } from "@shared/constants/auth.constants.ts";
import { DOMAIN_ERRORS } from "@shared/constants/error-messages.constants.ts";
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
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith(authConstants.BEARER_PREFIX)) {
		res
			.status(HttpStatus.UNAUTHORIZED)
			.json(
				ApiResponse.fail(
					DOMAIN_ERRORS.MESSAGES.AUTH_HEADER_REQUIRED,
					HttpStatus.UNAUTHORIZED,
					DOMAIN_ERRORS.CODES.UNAUTHORIZED,
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
					DOMAIN_ERRORS.MESSAGES.INVALID_OR_EXPIRED_TOKEN,
					HttpStatus.UNAUTHORIZED,
					DOMAIN_ERRORS.CODES.UNAUTHORIZED,
				),
			);
	}
}
