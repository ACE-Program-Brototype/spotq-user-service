import { config } from "@config/env.ts";
import { S2S_CALLER_SERVICES } from "@shared/constants/auth.constants.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { ApiResponse } from "@shared/response/index.ts";
import { authMiddleware, type TokenVerifierConfig } from "@spotq-org/s2s-core";
import type { NextFunction, Request, RequestHandler, Response } from "express";

export function internalS2SAuthMiddleware(): RequestHandler {
	const verifierConfig: TokenVerifierConfig = {
		expectedAudience: config.s2s.audience,
		getPublicKey: (callerService: string) => {
			const publicKeyMap: Record<string, string | undefined> = {
				[S2S_CALLER_SERVICES.RESTAURANT_SERVICE]:
					config.s2s.restaurantPublicKey,
				[S2S_CALLER_SERVICES.ORDER_SERVICE]: config.s2s.orderPublicKey,
			};
			return publicKeyMap[callerService] ?? null;
		},
	};

	return authMiddleware(verifierConfig);
}

export function requireCallerService(
	allowedServices: string | string[],
): RequestHandler {
	const allowed = Array.isArray(allowedServices)
		? allowedServices
		: [allowedServices];

	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.callerService || !allowed.includes(req.callerService)) {
			res
				.status(HttpStatus.FORBIDDEN)
				.json(
					ApiResponse.fail(
						`Caller '${req.callerService}' is not authorized to access this resource`,
						HttpStatus.FORBIDDEN,
						"FORBIDDEN",
					),
				);
			return;
		}
		next();
	};
}
