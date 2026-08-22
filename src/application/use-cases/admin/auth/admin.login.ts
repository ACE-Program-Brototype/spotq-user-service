import type { AdminLoginDTO } from "@application/dtos/admin/auth/admin.login.dto";
import { toAdminLoginResponse } from "@application/mappers/admin/auth/admin.login.mapper";
import type {
	IAdminPasswordHasher,
	IAdminTokenService,
} from "@application/ports/services/index.ts";
import type { IAdminLoginUseCase } from "@application/ports/use-cases/admin/auth/IAdmin.login";
import { TYPES } from "@config/di/types.ts";
import { Admin } from "@domain/entities/admin";
import { InvalidCredentialsError } from "@domain/errors/invalid.credentials.error";
import type { IAdminAuthRepository } from "@domain/repository/admin/IAdmin.auth.repo";
import { inject, injectable } from "inversify";

@injectable()
export class AdminLoginUseCase implements IAdminLoginUseCase {
	constructor(
		@inject(TYPES.AdminAuthRepository)
		private readonly _adminAuthRepo: IAdminAuthRepository,
		@inject(TYPES.PasswordService)
		private readonly _passwordHasher: IAdminPasswordHasher,
		@inject(TYPES.AdminTokenService)
		private readonly _tokenService: IAdminTokenService,
	) {}

	async execute(email: string, password: string): Promise<AdminLoginDTO> {
		const user = await this._adminAuthRepo.findByEmail(email);

		if (!user) {
			throw new InvalidCredentialsError();
		}

		const isPasswordValid = await this._passwordHasher.verifyPassword(
			password,
			user.passwordHash,
		);

		if (!isPasswordValid) {
			throw new InvalidCredentialsError();
		}

		const role = "admin";

		const accessToken = this._tokenService.generateAccessToken({
			userId: user.id,
			role,
		});
		const refreshToken = this._tokenService.generateRefreshToken({
			userId: user.id,
			role,
		});

		const domainUser = new Admin(
			user.id,
			user.name,
			user.email,
			user.passwordHash,
			user.createdAt,
			user.updatedAt,
		);

		return toAdminLoginResponse(domainUser, accessToken, refreshToken);
	}
}
