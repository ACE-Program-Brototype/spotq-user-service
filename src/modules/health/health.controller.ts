import { InjectHealthService } from "@config/di/decorators.js";
import type { IHealthService } from "@infrastructure/health/health.interface.js";
import { HealthStatus } from "@shared/constants/health-status.constants.js";
import { HttpStatus } from "@shared/constants/http.constants.js";
import type { Request, Response } from "express";
import { injectable } from "inversify";

@injectable()
export class HealthController {
	private readonly healthService: IHealthService;

	constructor(@InjectHealthService() healthService: IHealthService) {
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
