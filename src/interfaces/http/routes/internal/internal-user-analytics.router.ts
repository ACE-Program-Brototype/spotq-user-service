import { TYPES } from "@config/di/types.ts";
import type { InternalUserAnalyticsController } from "@interfaces/http/controllers/internal/internal-user-analytics.controller.ts";
import {
	internalS2SAuthMiddleware,
	requireCallerService,
} from "@interfaces/http/middlewares/internal-s2s-auth.middleware.ts";
import { S2S_CALLER_SERVICES } from "@shared/constants/auth.constants.ts";
import { INTERNAL_ROUTES } from "@shared/constants/routes.constants.ts";
import { Router } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class InternalUserAnalyticsRouter {
	public router: Router;

	constructor(
		@inject(TYPES.InternalUserAnalyticsController)
		private readonly controller: InternalUserAnalyticsController,
	) {
		this.router = Router();
		this.registerRoutes();
	}

	private registerRoutes(): void {
		this.router.use(internalS2SAuthMiddleware());
		this.router.get(
			INTERNAL_ROUTES.ANALYTICS_USERS_SUMMARY,
			requireCallerService(S2S_CALLER_SERVICES.RESTAURANT_SERVICE),
			this.controller.getUserSummary,
		);
	}
}
