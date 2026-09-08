/**
 * Inversify container module for user domain dependencies.
 * Registers repositories, use cases, controllers, and routers.
 */
import { CustomerForgotPasswordUseCase } from "@application/use-cases/customer.forgot-password.ts";
import { CustomerResetPasswordUseCase } from "@application/use-cases/customer.reset.password.ts";
import { CustomerVerifyForgotPasswordUseCase } from "@application/use-cases/customer.verify.forgot-password.ts";
import {
	GetCustomerProfileUseCase,
	GoogleAuthUseCase,
	LoginUseCase,
	LogoutUseCase,
	RefreshTokenUseCase,
	RegisterUserUseCase,
	ResendEmailOtpUseCase,
	VerifyEmailOtpUseCase,
} from "@application/use-cases/index.ts";
import type { IDeviceRepository } from "@domain/repositories/device.repository.interface.ts";
import type { IRefreshTokenRepository } from "@domain/repositories/refresh-token.repository.interface.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import {
	PrismaDeviceRepository,
	PrismaRefreshTokenRepository,
	PrismaUserRepository,
} from "@infrastructure/database/repositories/index.ts";
import { CustomerProfileController } from "@interfaces/http/controllers/customer/customer-profile.controller.ts";
import { UserAuthController } from "@interfaces/http/controllers/customer/user.auth.controller.ts";
import { UserRouter } from "@interfaces/http/routes/user.routes.ts";
import type {
	IGetCustomerProfileUseCase,
	IGoogleAuthUseCase,
	ILoginUseCase,
	ILogoutUseCase,
	IRefreshTokenUseCase,
	IRegisterUserUseCase,
	IResendEmailOtpUseCase,
	IVerifyEmailOtpUseCase,
} from "@ports/use-cases/index.ts";
import { ContainerModule } from "inversify";
import { USER_TYPES } from "./user.types.ts";

export const userModule = new ContainerModule(({ bind }) => {
	bind<IUserRepository>(USER_TYPES.UserRepository).to(PrismaUserRepository);
	bind<IRefreshTokenRepository>(USER_TYPES.RefreshTokenRepository).to(
		PrismaRefreshTokenRepository,
	);
	bind<IDeviceRepository>(USER_TYPES.DeviceRepository).to(
		PrismaDeviceRepository,
	);

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
	bind<IGoogleAuthUseCase>(USER_TYPES.GoogleAuthUseCase).to(GoogleAuthUseCase);
	bind<ILoginUseCase>(USER_TYPES.LoginUseCase).to(LoginUseCase);
	bind<IRefreshTokenUseCase>(USER_TYPES.RefreshTokenUseCase).to(
		RefreshTokenUseCase,
	);
	bind<IGetCustomerProfileUseCase>(USER_TYPES.GetCustomerProfileUseCase).to(
		GetCustomerProfileUseCase,
	);

	bind<UserAuthController>(USER_TYPES.UserAuthController).to(
		UserAuthController,
	);
	bind<CustomerProfileController>(USER_TYPES.CustomerProfileController).to(
		CustomerProfileController,
	);
	bind<UserRouter>(USER_TYPES.UserRouter).to(UserRouter);

	bind<CustomerForgotPasswordUseCase>(
		USER_TYPES.CustomerForgotPasswordUseCase,
	).to(CustomerForgotPasswordUseCase);
	bind<CustomerVerifyForgotPasswordUseCase>(
		USER_TYPES.CustomerVerifyForgotPasswordUseCase,
	).to(CustomerVerifyForgotPasswordUseCase);
	bind<CustomerResetPasswordUseCase>(
		USER_TYPES.CustomerResetPasswordUseCase,
	).to(CustomerResetPasswordUseCase);
});
