import { ContainerModule } from "inversify";
import type {
	IEmailQueueProducer,
	IEmailService,
	IOtpService,
	IPasswordHasher,
	ITokenService,
	IIdGenerator,
	ILogger,
} from "@application/ports/services/index.ts";
import { PrismaService } from "@infrastructure/database/prisma/database.service.ts";
import type { IHealthCheckable } from "@infrastructure/health/health.interface.ts";
import { BullMQService } from "@infrastructure/queue/bullmq.service.ts";
import { EmailQueueProducer } from "@infrastructure/queue/email-queue.producer.ts";
import { EmailQueueWorker } from "@infrastructure/queue/email-queue.worker.ts";
import { RedisService } from "@infrastructure/redis/redis.service.ts";
import {
	BcryptPasswordHasher,
	BrevoEmailService,
	JwtTokenService,
	RedisOtpService,
	CryptoIdGenerator,
	PinoLoggerService,
} from "@infrastructure/services/index.ts";
import { INFRASTRUCTURE_TYPES } from "./infrastructure.types.ts";

export const infrastructureModule = new ContainerModule(({ bind }) => {
	// Infrastructure Services & Health Checkables
	bind<PrismaService>(INFRASTRUCTURE_TYPES.PrismaService).to(PrismaService);
	bind<IHealthCheckable>(INFRASTRUCTURE_TYPES.DatabaseHealthCheckable).toService(
		INFRASTRUCTURE_TYPES.PrismaService,
	);

	bind<RedisService>(INFRASTRUCTURE_TYPES.RedisService).to(RedisService);
	bind<IHealthCheckable>(INFRASTRUCTURE_TYPES.RedisHealthCheckable).toService(
		INFRASTRUCTURE_TYPES.RedisService,
	);

	bind<BullMQService>(INFRASTRUCTURE_TYPES.BullMQService).to(BullMQService);
	bind<IHealthCheckable>(INFRASTRUCTURE_TYPES.BullMQHealthCheckable).toService(
		INFRASTRUCTURE_TYPES.BullMQService,
	);

	// Core Security & Messaging Services
	bind<IIdGenerator>(INFRASTRUCTURE_TYPES.IdGenerator).to(CryptoIdGenerator);
	bind<IPasswordHasher>(INFRASTRUCTURE_TYPES.PasswordHasher).to(
		BcryptPasswordHasher,
	);
	bind<ITokenService>(INFRASTRUCTURE_TYPES.TokenService).to(JwtTokenService);
	bind<IOtpService>(INFRASTRUCTURE_TYPES.OtpService).to(RedisOtpService);
	bind<IEmailService>(INFRASTRUCTURE_TYPES.EmailService).to(BrevoEmailService);
	bind<IEmailQueueProducer>(INFRASTRUCTURE_TYPES.EmailQueueProducer).to(
		EmailQueueProducer,
	);
	bind<EmailQueueWorker>(INFRASTRUCTURE_TYPES.EmailQueueWorker).to(
		EmailQueueWorker,
	);
	bind<ILogger>(INFRASTRUCTURE_TYPES.Logger).to(PinoLoggerService).inSingletonScope();
});
