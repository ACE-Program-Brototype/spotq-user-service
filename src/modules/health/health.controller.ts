import { InjectHealthService } from "@config/di/decorators.ts";
import type { IHealthService } from "@infrastructure/health/health.interface.ts";
import { HealthStatus, HttpStatus } from "@shared/constants/index.ts";
import type { Request, Response } from "express";
import { injectable } from "inversify";

@injectable()
export class HealthController {
	private readonly _healthService: IHealthService;

	constructor(@InjectHealthService() healthService: IHealthService) {
		this._healthService = healthService;
	}

	check = async (_req: Request, res: Response): Promise<void> => {
		const result = await this._healthService.check();
		const statusCode =
			result.status === HealthStatus.UP
				? HttpStatus.OK
				: HttpStatus.SERVICE_UNAVAILABLE;
		res.status(statusCode).json(result);
	};
}
