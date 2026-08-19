import type {
	IIdGenerator,
	ILogger,
	IPasswordHasher,
	ITokenService,
} from "@application/ports/services/index.ts";
import { TYPES } from "@config/di/types.ts";
import { DeviceEntity } from "@domain/entities/device.entity.ts";
import { RefreshTokenEntity } from "@domain/entities/refresh-token.entity.ts";
import { UserStatus } from "@domain/entities/user.entity.ts";
import {
	AccountBlockedError,
	AccountInactiveError,
	InvalidCredentialsError,
} from "@domain/errors/domain.error.ts";
import type {
	IDeviceRepository,
	IRefreshTokenRepository,
	IUserRepository,
} from "@domain/repositories/index.ts";
import type { ILoginUseCase } from "@ports/use-cases/index.ts";
import { inject, injectable } from "inversify";
import type { LoginDto, LoginResultDto } from "../dtos/login.dto.ts";
import { UserDtoMapper } from "../mappers/user-dto.mapper.ts";

@injectable()
export class LoginUseCase implements ILoginUseCase {
	constructor(
		@inject(TYPES.UserRepository)
		private readonly _userRepository: IUserRepository,
		@inject(TYPES.DeviceRepository)
		private readonly _deviceRepository: IDeviceRepository,
		@inject(TYPES.RefreshTokenRepository)
		private readonly _refreshTokenRepository: IRefreshTokenRepository,
		@inject(TYPES.PasswordHasher)
		private readonly _passwordHasher: IPasswordHasher,
		@inject(TYPES.TokenService)
		private readonly _tokenService: ITokenService,
		@inject(TYPES.IdGenerator)
		private readonly _idGenerator: IIdGenerator,
		@inject(TYPES.Logger)
		private readonly _logger: ILogger,
	) {}

	public async execute(params: LoginDto): Promise<LoginResultDto> {
		const normalizedEmail = params.email.trim().toLowerCase();

		try {
			// 1. User Lookup
			const user = await this._userRepository.findByEmail(normalizedEmail);
			if (!user) {
				this._logger.warn(
					{ event: "LOGIN_FAILED", email: normalizedEmail },
					"Login failed: User not found",
				);
				throw new InvalidCredentialsError();
			}

			// 2. Validate Account Status
			if (user.status === UserStatus.BLOCKED) {
				this._logger.warn(
					{ event: "LOGIN_BLOCKED_ACCOUNT", userId: user.id },
					"Login failed: Account is blocked",
				);
				throw new AccountBlockedError();
			}

			if (user.status === UserStatus.INACTIVE) {
				this._logger.warn(
					{ event: "LOGIN_INACTIVE_ACCOUNT", userId: user.id },
					"Login failed: Account is inactive",
				);
				throw new AccountInactiveError();
			}

			// 3. Verify Password
			if (!user.passwordHash) {
				// Google-only account or no password set
				this._logger.warn(
					{ event: "LOGIN_FAILED", userId: user.id },
					"Login failed: Password hash missing (Google-only account)",
				);
				throw new InvalidCredentialsError();
			}

			const isPasswordValid = await this._passwordHasher.compare(
				params.password,
				user.passwordHash,
			);

			if (!isPasswordValid) {
				this._logger.warn(
					{ event: "LOGIN_FAILED", userId: user.id },
					"Login failed: Incorrect password",
				);
				throw new InvalidCredentialsError();
			}

			// 4. Device Handling
			let deviceId: string | null = null;
			if (params.device?.platform) {
				const existingDevice =
					await this._deviceRepository.findByUserIdAndPlatform(
						user.id,
						params.device.platform,
					);

				if (existingDevice) {
					existingDevice.updateFcmToken(params.device.fcmToken ?? null);
					existingDevice.updateLastLogin();
					await this._deviceRepository.save(existingDevice);
					deviceId = existingDevice.id;
				} else {
					deviceId = this._idGenerator.generateUuid();
					const newDevice = DeviceEntity.create({
						id: deviceId,
						userId: user.id,
						fcmToken: params.device.fcmToken ?? null,
						deviceName: params.device.deviceName ?? null,
						platform: params.device.platform,
					});
					await this._deviceRepository.save(newDevice);
				}
			}

			// 5. Session Creation (Refresh Token)
			const refreshTokenData = this._tokenService.generateRefreshToken();
			const refreshTokenEntity = RefreshTokenEntity.create({
				id: this._idGenerator.generateUuid(),
				userId: user.id,
				deviceId,
				tokenHash: refreshTokenData.tokenHash,
				expiresAt: refreshTokenData.expiresAt,
			});

			await this._refreshTokenRepository.save(refreshTokenEntity);

			this._logger.info(
				{ event: "SESSION_CREATED", userId: user.id, deviceId },
				"Authentication session / refresh token created",
			);

			// 6. Generate Access Token
			const accessToken = this._tokenService.generateAccessToken({
				userId: user.id,
				email: user.email.getValue(),
			});

			this._logger.info(
				{ event: "LOGIN_SUCCESS", userId: user.id },
				"User login successful",
			);

			return {
				user: UserDtoMapper.toLoginResponse(user),
				accessToken,
				refreshToken: refreshTokenData.token,
			};
		} catch (error) {
			if (
				error instanceof InvalidCredentialsError ||
				error instanceof AccountBlockedError ||
				error instanceof AccountInactiveError
			) {
				throw error;
			}

			this._logger.error(
				{ err: error, email: normalizedEmail },
				"Unexpected error during login execution",
			);
			throw error;
		}
	}
}
