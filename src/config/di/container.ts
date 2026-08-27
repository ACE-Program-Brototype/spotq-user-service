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
import { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo.ts";
import { IAdminLoginUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.login.ts";
import { IRefreshTokenRepository } from "@domain/repository/shared/IToken.repo.ts";
import { IAdminLogoutUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.logout.ts";
import { IOtpService } from "@domain/repository/shared/IOtp.service.ts";
import { IEmailQueueProducer } from "@domain/repository/shared/IEmail.queue.producer.ts";
import { IAdminForgotPasswordUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.forgot-password.ts";
import { IAdminVerifyEmailForgotPasswordUseCase } from "@application/ports/use-cases/admin/auth/IVerify.email.forgot-password.ts";
import { IAdminResetPasswordUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.reset.password.ts";
import { IPasswordHashService } from "@application/ports/services/IPassword.service.ts";
import { ITokenService } from "@application/ports/services/IToken.service.ts";

const container = new Container({ defaultScope: "Singleton" });

container.load(infrastructureModule);
container.load(userModule);
container.load(healthModule);

container
	.bind<IAdminAuthRepository>(TYPES.AdminAuthRepository)
	.to(AdminAuthRepository);
container
	.bind<IAdminLoginUseCase>(TYPES.AdminLoginUseCase)
	.to(AdminLoginUseCase);
container
	.bind<AdminAuthController>(TYPES.AdminAuthController)
	.to(AdminAuthController);

container
	.bind<IRefreshTokenRepository>(TYPES.RefreshTokenRepositories)
	.to(RefreshTokenRepository);

container
	.bind<IAdminLogoutUseCase>(TYPES.AdminLogoutUseCase)
	.to(AdminLogoutUseCase);
container.bind<IOtpService>(TYPES.OtpServices).to(RedisOtpService);
container
	.bind<IEmailQueueProducer>(TYPES.EmailQueueProducers)
	.to(EmailQueueProducer);
container
	.bind<IAdminForgotPasswordUseCase>(TYPES.AdminForgotPasswordUseCase)
	.to(AdminForgotPasswordUseCase);
container
	.bind<IAdminVerifyEmailForgotPasswordUseCase>(
		TYPES.AdminForgotPasswordEmailVerifyUseCase,
	)
	.to(VerifyForgotPasswordEmailUseCase);
container
	.bind<IAdminResetPasswordUseCase>(TYPES.AdminResetPasswordUseCase)
	.to(AdminResetPasswordUseCase);

container
	.bind<IPasswordHashService>(TYPES.PasswordService)
	.to(BcryptPasswordHasher);
container.bind<ITokenService>(TYPES.TokenServices).to(JwtTokenService);

export { container };
