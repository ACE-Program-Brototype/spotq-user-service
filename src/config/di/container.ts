import "reflect-metadata";
import { AdminForgotPasswordUseCase } from "@application/use-cases/admin/auth/admin.forgot-password.ts";
import { AdminLoginUseCase } from "@application/use-cases/admin/auth/admin.login.ts";
import { AdminLogoutUseCase } from "@application/use-cases/admin/auth/admin.logout.ts";
import { AdminResetPasswordUseCase } from "@application/use-cases/admin/auth/admin.reset.password.ts";
import { VerifyForgotPasswordEmailUseCase } from "@application/use-cases/admin/auth/verify.email.forgot-password.ts";
import { PrismaService } from "@infrastructure/database/prisma/database.service.ts";
import type {
	IHealthCheckable,
	IHealthService,
} from "@infrastructure/health/health.interface.ts";
import { BullMQService } from "@infrastructure/queue/bullmq.service.ts";
import { EmailQueueProducer } from "@infrastructure/queue/email.queue.producer.ts";
import { EmailQueueWorker } from "@infrastructure/queue/email.queue.worker.ts";
import { RedisService } from "@infrastructure/redis/redis.service.ts";
import { AdminAuthRepository } from "@infrastructure/repositories/admin/admin.auth.repo.ts";
import { RefreshTokenRepository } from "@infrastructure/repositories/shared/token.repo.ts";
import { BrevoEmailService } from "@infrastructure/services/brevo.email.ts";
import { RedisOtpService } from "@infrastructure/services/redis.otp.ts";
import { HealthController } from "@modules/health/health.controller.ts";
import { HealthRouter } from "@modules/health/health.routes.ts";
import { HealthService } from "@modules/health/health.service.ts";
import { AdminAuthController } from "@presentation/http/controllers/admin/auth.controller.ts";
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

// Domain / Application Services
container.bind<IHealthService>(TYPES.HealthService).to(HealthService);

// HTTP Controllers & Routers
container.bind<HealthController>(TYPES.HealthController).to(HealthController);
container.bind<HealthRouter>(TYPES.HealthRouter).to(HealthRouter);

container
	.bind<AdminAuthRepository>(TYPES.AdminAuthRepository)
	.to(AdminAuthRepository);
container
	.bind<AdminLoginUseCase>(TYPES.AdminLoginUseCase)
	.to(AdminLoginUseCase);
container
	.bind<AdminAuthController>(TYPES.AdminAuthController)
	.to(AdminAuthController);

container
	.bind<RefreshTokenRepository>(TYPES.RefreshTokenRepository)
	.to(RefreshTokenRepository);

container
	.bind<AdminLogoutUseCase>(TYPES.AdminLogoutUseCase)
	.to(AdminLogoutUseCase);
container.bind<RedisOtpService>(TYPES.OtpService).to(RedisOtpService);
container
	.bind<EmailQueueProducer>(TYPES.EmailQueueProducer)
	.to(EmailQueueProducer);
container
	.bind<AdminForgotPasswordUseCase>(TYPES.AdminForgotPasswordUseCase)
	.to(AdminForgotPasswordUseCase);
container.bind<BrevoEmailService>(TYPES.EmailService).to(BrevoEmailService);
container.bind<EmailQueueWorker>(TYPES.EmailQueueWorker).to(EmailQueueWorker);
container
	.bind<VerifyForgotPasswordEmailUseCase>(
		TYPES.AdminForgotPasswordEmailVerifyUseCase,
	)
	.to(VerifyForgotPasswordEmailUseCase);
container
	.bind<AdminResetPasswordUseCase>(TYPES.AdminResetPasswordUseCase)
	.to(AdminResetPasswordUseCase);

export { container };
