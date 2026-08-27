import type { IPasswordHashService } from "@application/ports/services";
import type { ICustomerResetPasswordUseCase } from "@application/ports/use-cases/ICustomer.reset.password";
import { TYPES } from "@config/di/types.ts";
import { UserNotFoundError } from "@domain/errors";
import { ResetPasswordFailedError } from "@domain/errors/reset.password.error";
import type { IUserRepository } from "@domain/repositories";
import { inject, injectable } from "inversify";

@injectable()
export class CustomerResetPasswordUseCase
	implements ICustomerResetPasswordUseCase
{
	constructor(
		@inject(TYPES.UserRepository)
		private readonly _userRepository: IUserRepository,
		@inject(TYPES.PasswordServices)
		private readonly _passwordService: IPasswordHashService,
	) {}

	async execute(userId: string, password: string): Promise<void> {
		const user = await this._userRepository.findById(userId);

		if (!user) {
			throw new UserNotFoundError();
		}

		const passwordHash = await this._passwordService.hashPassword(password);

		user.changePassword(passwordHash);

		const updatedUser = await this._userRepository.update(userId, user);

		if (!updatedUser) {
			throw new ResetPasswordFailedError();
		}
	}
}
