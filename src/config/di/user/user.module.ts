import { ContainerModule } from "inversify";
import {
	LogoutUseCase,
	RegisterUserUseCase,
	ResendEmailOtpUseCase,
	VerifyEmailOtpUseCase,
} from "@application/use-cases/index.ts";
import type {
	ILogoutUseCase,
	IRegisterUserUseCase,
	IResendEmailOtpUseCase,
	IVerifyEmailOtpUseCase,
} from "@ports/use-cases/index.ts";
import type { IDeviceRepository } from "@domain/repositories/device.repository.interface.ts";
import type { IRefreshTokenRepository } from "@domain/repositories/refresh-token.repository.interface.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import {
	PrismaDeviceRepository,
	PrismaRefreshTokenRepository,
	PrismaUserRepository,
} from "@infrastructure/database/repositories/index.ts";
import { UserController } from "@interfaces/http/controllers/user.controller.ts";
import { UserRouter } from "@interfaces/http/routes/user.routes.ts";
import { USER_TYPES } from "./user.types.ts";

export const userModule = new ContainerModule(({ bind }) => {
	// Repositories
	bind<IUserRepository>(USER_TYPES.UserRepository).to(PrismaUserRepository);
	bind<IRefreshTokenRepository>(USER_TYPES.RefreshTokenRepository).to(
		PrismaRefreshTokenRepository,
	);
	bind<IDeviceRepository>(USER_TYPES.DeviceRepository).to(
		PrismaDeviceRepository,
	);

	// Application Use Cases
	bind<IRegisterUserUseCase>(USER_TYPES.RegisterUserUseCase).to(
		RegisterUserUseCase,
	);
	bind<IVerifyEmailOtpUseCase>(USER_TYPES.VerifyEmailOtpUseCase).to(
		VerifyEmailOtpUseCase,
	);
	bind<IResendEmailOtpUseCase>(USER_TYPES.ResendEmailOtpUseCase).to(
		ResendEmailOtpUseCase,
	);
	bind<ILogoutUseCase>(USER_TYPES.LogoutUseCase).to(LogoutUseCase);

	// HTTP Controllers & Routers
	bind<UserController>(USER_TYPES.UserController).to(UserController);
	bind<UserRouter>(USER_TYPES.UserRouter).to(UserRouter);
});
