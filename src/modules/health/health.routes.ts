import { TYPES } from "@config/di/index.ts";
import { Routes } from "@shared/constants/index.ts";
import { Router } from "express";
import { inject, injectable } from "inversify";
import type { HealthController } from "./health.controller.ts";

@injectable()
export class HealthRouter {
	public router: Router;
	private readonly healthController: HealthController;

	constructor(
		@inject(TYPES.HealthController)
		healthController: HealthController,
	) {
		this.router = Router();
		this.healthController = healthController;
		this.init();
	}

	private init() {
		this.router.get(Routes.HEALTH, this.healthController.check);
	}
}
