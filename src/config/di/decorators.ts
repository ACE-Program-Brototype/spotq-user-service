import { inject } from "inversify";
import { TYPES } from "./types.ts";

export const InjectDatabaseHealth = () => inject(TYPES.DatabaseHealthCheckable);
export const InjectRedisHealth = () => inject(TYPES.RedisHealthCheckable);
export const InjectBullMQHealth = () => inject(TYPES.BullMQHealthCheckable);
export const InjectHealthService = () => inject(TYPES.HealthService);
export const InjectHealthController = () => inject(TYPES.HealthController);
export const InjectHealthRouter = () => inject(TYPES.HealthRouter);
export const InjectAdminAuthRepository = () =>
	inject(TYPES.AdminAuthRepository);
export const InjectAdminLoginUseCase = () => inject(TYPES.AdminLoginUseCase);
