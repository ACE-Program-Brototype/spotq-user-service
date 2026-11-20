import { TYPES } from "@config/di/types";
import type { IHealthService } from "@infrastructure/health/health.interface.ts";
import { HealthStatus, HttpStatus } from "@shared/constants/index.ts";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class HealthController {
	private readonly healthService: IHealthService;

	constructor(@inject(TYPES.HealthService) healthService: IHealthService) {
		this.healthService = healthService;
	}

	check = async (_req: Request, res: Response): Promise<void> => {
		const result = await this.healthService.check();
		const statusCode =
			result.status === HealthStatus.UP
				? HttpStatus.OK
				: HttpStatus.SERVICE_UNAVAILABLE;
		res.status(statusCode).json(result);
	};
}
