import { HealthStatus } from "@shared/constants/health-status.constants.js";
import { HttpStatus } from "@shared/constants/http.constants.js";
import type { Request, Response } from "express";
import type { HealthService } from "./health.service.js";

export class HealthController {
	private readonly healthService: HealthService;

	constructor(healthService: HealthService) {
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
