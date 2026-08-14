import "reflect-metadata";
import type {
	IEmailQueueProducer,
	IEmailService,
	IOtpService,
	IPasswordHasher,
	ITokenService,
} from "@application/ports/services/index.ts";
import {
	LogoutUseCase,
	RegisterUserUseCase,
	ResendEmailOtpUseCase,
	VerifyEmailOtpUseCase,
} from "@application/use-cases/index.ts";
import type { IDeviceRepository } from "@domain/repositories/device.repository.interface.ts";
import type { IRefreshTokenRepository } from "@domain/repositories/refresh-token.repository.interface.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { PrismaService } from "@infrastructure/database/prisma/database.service.ts";
import {
	PrismaDeviceRepository,
	PrismaRefreshTokenRepository,
	PrismaUserRepository,
} from "@infrastructure/database/repositories/index.ts";
import type {
	IHealthCheckable,
	IHealthService,
} from "@infrastructure/health/health.interface.ts";
import { BullMQService } from "@infrastructure/queue/bullmq.service.ts";
import { EmailQueueProducer } from "@infrastructure/queue/email-queue.producer.ts";
import { EmailQueueWorker } from "@infrastructure/queue/email-queue.worker.ts";
import { RedisService } from "@infrastructure/redis/redis.service.ts";
import {
	BcryptPasswordHasher,
	BrevoEmailService,
	JwtTokenService,
	RedisOtpService,
} from "@infrastructure/services/index.ts";
import { UserController } from "@interfaces/http/controllers/user.controller.ts";
import { UserRouter } from "@interfaces/http/routes/user.routes.ts";
import { HealthController } from "@modules/health/health.controller.ts";
import { HealthRouter } from "@modules/health/health.routes.ts";
import { HealthService } from "@modules/health/health.service.ts";
import { Container } from "inversify";
import { TYPES } from "./types.ts";

const container = new Container({ defaultScope: "Singleton" });

// Infrastructure Services & Health Checkables
container.bind<PrismaService>(TYPES.PrismaService).to(PrismaService);
container
	.bind<IHealthCheckable>(TYPES.DatabaseHealthCheckable)
	.toService(TYPES.PrismaService);

container.bind<RedisService>(TYPES.RedisService).to(RedisService);
container
	.bind<IHealthCheckable>(TYPES.RedisHealthCheckable)
	.toService(TYPES.RedisService);

container.bind<BullMQService>(TYPES.BullMQService).to(BullMQService);
container
	.bind<IHealthCheckable>(TYPES.BullMQHealthCheckable)
	.toService(TYPES.BullMQService);

// Repositories
container.bind<IUserRepository>(TYPES.UserRepository).to(PrismaUserRepository);
container
	.bind<IRefreshTokenRepository>(TYPES.RefreshTokenRepository)
	.to(PrismaRefreshTokenRepository);
container
	.bind<IDeviceRepository>(TYPES.DeviceRepository)
	.to(PrismaDeviceRepository);

// Core Security & Messaging Services
container.bind<IPasswordHasher>(TYPES.PasswordHasher).to(BcryptPasswordHasher);
container.bind<ITokenService>(TYPES.TokenService).to(JwtTokenService);
container.bind<IOtpService>(TYPES.OtpService).to(RedisOtpService);
container.bind<IEmailService>(TYPES.EmailService).to(BrevoEmailService);
container
	.bind<IEmailQueueProducer>(TYPES.EmailQueueProducer)
	.to(EmailQueueProducer);
container.bind<EmailQueueWorker>(TYPES.EmailQueueWorker).to(EmailQueueWorker);

// Application Use Cases
container
	.bind<RegisterUserUseCase>(TYPES.RegisterUserUseCase)
	.to(RegisterUserUseCase);
container
	.bind<VerifyEmailOtpUseCase>(TYPES.VerifyEmailOtpUseCase)
	.to(VerifyEmailOtpUseCase);
container
	.bind<ResendEmailOtpUseCase>(TYPES.ResendEmailOtpUseCase)
	.to(ResendEmailOtpUseCase);
container.bind<LogoutUseCase>(TYPES.LogoutUseCase).to(LogoutUseCase);

// Domain / Health Services
container.bind<IHealthService>(TYPES.HealthService).to(HealthService);

// HTTP Controllers & Routers
container.bind<HealthController>(TYPES.HealthController).to(HealthController);
container.bind<HealthRouter>(TYPES.HealthRouter).to(HealthRouter);

container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<UserRouter>(TYPES.UserRouter).to(UserRouter);

export { container };
