import { config } from "@config/env.ts";
import { S2S_CALLER_SERVICES } from "@shared/constants/auth.constants.ts";
import { HttpStatus } from "@shared/constants/http.constants.ts";
import { authMiddleware, type TokenVerifierConfig } from "@spotq-org/s2s-core";
import type { NextFunction, Request, RequestHandler, Response } from "express";

export function internalS2SAuthMiddleware(): RequestHandler {
	const verifierConfig: TokenVerifierConfig = {
		expectedAudience: config.s2s.audience,
		getPublicKey: (callerService: string) => {
			if (callerService === S2S_CALLER_SERVICES.RESTAURANT_SERVICE) {
				return config.s2s.restaurantPublicKey;
			}
			if (
				callerService === S2S_CALLER_SERVICES.ORDER_SERVICE &&
				config.s2s.orderPublicKey
			) {
				return config.s2s.orderPublicKey;
			}
			return null;
		},
	};

	return authMiddleware(verifierConfig);
}

export function requireCallerService(allowedService: string): RequestHandler {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (req.callerService !== allowedService) {
			res.status(HttpStatus.FORBIDDEN).json({
				success: false,
				statusCode: HttpStatus.FORBIDDEN,
				code: "FORBIDDEN",
				message: `Caller '${req.callerService}' is not authorized to access this resource`,
			});
			return;
		}
		next();
	};
}
