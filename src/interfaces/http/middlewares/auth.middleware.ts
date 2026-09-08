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
	const userId = getHeaderValue(req.headers["x-user-id"]);

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

	const role = getHeaderValue(req.headers["x-user-role"]);
	const email = getHeaderValue(req.headers["x-user-email"]);

	req.user = {
		userId,
		email: email || "",
		role,
	};
	req.userId = userId;

	next();
}
