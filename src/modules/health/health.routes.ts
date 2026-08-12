import { InjectHealthController } from "@config/di/decorators.ts";
import { Routes } from "@shared/constants/index.ts";
import { Router } from "express";
import { injectable } from "inversify";
import type { HealthController } from "./health.controller.ts";

@injectable()
export class HealthRouter {
	public router: Router;
	private readonly healthController: HealthController;

	constructor(
		@InjectHealthController()
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
