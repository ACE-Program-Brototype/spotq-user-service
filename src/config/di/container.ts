import "reflect-metadata";
import { AdminForgotPasswordUseCase } from "@application/use-cases/admin/auth/admin.forgot-password.ts";
import { AdminLoginUseCase } from "@application/use-cases/admin/auth/admin.login.ts";
import { AdminLogoutUseCase } from "@application/use-cases/admin/auth/admin.logout.ts";
import { AdminResetPasswordUseCase } from "@application/use-cases/admin/auth/admin.reset.password.ts";
import { VerifyForgotPasswordEmailUseCase } from "@application/use-cases/admin/auth/verify.email.forgot-password.ts";
import { EmailQueueProducer } from "@infrastructure/queue/email.queue.producer.ts";
import { AdminAuthRepository } from "@infrastructure/repositories/admin/admin.auth.repo.ts";
import { RefreshTokenRepository } from "@infrastructure/repositories/shared/token.repo.ts";
import { BcryptPasswordHasher } from "@infrastructure/services/password.ts";
import { RedisOtpService } from "@infrastructure/services/redis.otp.ts";
import { JwtTokenService } from "@infrastructure/services/token.ts";
import { AdminAuthController } from "@interfaces/http/controllers/admin/auth.controller.ts";
import { Container } from "inversify";
import { healthModule } from "./health/health.module.ts";
import { infrastructureModule } from "./infrastructure/infrastructure.module.ts";
import { TYPES } from "./types.ts";
import { userModule } from "./user/user.module.ts";

const container = new Container({ defaultScope: "Singleton" });

container.load(infrastructureModule);
container.load(userModule);
container.load(healthModule);

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
	.bind<RefreshTokenRepository>(TYPES.RefreshTokenRepositories)
	.to(RefreshTokenRepository);

container
	.bind<AdminLogoutUseCase>(TYPES.AdminLogoutUseCase)
	.to(AdminLogoutUseCase);
container.bind<RedisOtpService>(TYPES.OtpServices).to(RedisOtpService);
container
	.bind<EmailQueueProducer>(TYPES.EmailQueueProducers)
	.to(EmailQueueProducer);
container
	.bind<AdminForgotPasswordUseCase>(TYPES.AdminForgotPasswordUseCase)
	.to(AdminForgotPasswordUseCase);
container
	.bind<VerifyForgotPasswordEmailUseCase>(
		TYPES.AdminForgotPasswordEmailVerifyUseCase,
	)
	.to(VerifyForgotPasswordEmailUseCase);
container
	.bind<AdminResetPasswordUseCase>(TYPES.AdminResetPasswordUseCase)
	.to(AdminResetPasswordUseCase);

container
	.bind<BcryptPasswordHasher>(TYPES.PasswordService)
	.to(BcryptPasswordHasher);
container.bind<JwtTokenService>(TYPES.TokenServices).to(JwtTokenService);

export { container };
