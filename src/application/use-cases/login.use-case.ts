import type {
	IIdGenerator,
	ILogger,
	IPasswordHasher,
} from "@application/ports/services/index.ts";
import type { ITokenService } from "@application/ports/services/token-service.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { DeviceEntity } from "@domain/entities/device.entity.ts";
import { RefreshTokenEntity } from "@domain/entities/refresh-token.entity.ts";
import { UserStatus } from "@domain/entities/user.entity.ts";
import { InvalidCredentialsError } from "@domain/errors/domain.error.ts";
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
		private readonly userRepository: IUserRepository,
		@inject(TYPES.DeviceRepository)
		private readonly deviceRepository: IDeviceRepository,
		@inject(TYPES.RefreshTokenRepository)
		private readonly refreshTokenRepository: IRefreshTokenRepository,
		@inject(TYPES.PasswordHasher)
		private readonly passwordHasher: IPasswordHasher,
		@inject(TYPES.TokenService)
		private readonly tokenService: ITokenService,
		@inject(TYPES.IdGenerator)
		private readonly idGenerator: IIdGenerator,
		@inject(TYPES.Logger)
		private readonly logger: ILogger,
	) {}

	public async execute(params: LoginDto): Promise<LoginResultDto> {
		const normalizedEmail = params.email.trim().toLowerCase();

		try {
			// 1. User Lookup
			const user = await this.userRepository.findByEmail(normalizedEmail);
			if (!user) {
				this.logger.warn(
					{ event: "LOGIN_FAILED", email: normalizedEmail },
					"Login failed: User not found",
				);
				// Dummy comparison to prevent timing attacks
				await this.passwordHasher.compare(
					params.password,
					"$2b$10$y613u91o.pP.xX2XhE8TqF9T1d6M2.8g1K2nO123456789012345",
				);
				throw new InvalidCredentialsError();
			}

			// 2. Verify Password
			if (!user.passwordHash) {
				// Google-only account or no password set
				this.logger.warn(
					{ event: "LOGIN_FAILED", userId: user.id },
					"Login failed: Password hash missing (Google-only account)",
				);
				// Dummy comparison to prevent timing attacks
				await this.passwordHasher.compare(
					params.password,
					"$2b$10$y613u91o.pP.xX2XhE8TqF9T1d6M2.8g1K2nO123456789012345",
				);
				throw new InvalidCredentialsError();
			}

			const isPasswordValid = await this.passwordHasher.compare(
				params.password,
				user.passwordHash,
			);

			if (!isPasswordValid) {
				this.logger.warn(
					{ event: "LOGIN_FAILED", userId: user.id },
					"Login failed: Incorrect password",
				);
				throw new InvalidCredentialsError();
			}

			// 3. Validate Account Status (only after password verification)
			if (user.status === UserStatus.BLOCKED) {
				this.logger.warn(
					{ event: "LOGIN_BLOCKED_ACCOUNT", userId: user.id },
					"Login failed: Account is blocked",
				);
				throw new InvalidCredentialsError();
			}

			if (user.status === UserStatus.INACTIVE) {
				this.logger.warn(
					{ event: "LOGIN_INACTIVE_ACCOUNT", userId: user.id },
					"Login failed: Account is inactive",
				);
				throw new InvalidCredentialsError();
			}

			// 4. Device Handling
			let deviceId: string | null = null;
			if (params.device?.platform) {
				const existingDevice =
					await this.deviceRepository.findByUserIdAndPlatform(
						user.id,
						params.device.platform,
					);

				if (existingDevice) {
					existingDevice.updateFcmToken(params.device.fcmToken ?? null);
					existingDevice.updateLastLogin();
					await this.deviceRepository.save(existingDevice);
					deviceId = existingDevice.id;
				} else {
					deviceId = this.idGenerator.generateUuid();
					const newDevice = DeviceEntity.create({
						id: deviceId,
						userId: user.id,
						fcmToken: params.device.fcmToken ?? null,
						deviceName: params.device.deviceName ?? null,
						platform: params.device.platform,
					});
					await this.deviceRepository.save(newDevice);
					deviceId = newDevice.id;
				}
			}

			// 5. Session Creation (Refresh Token)
			const refreshTokenData = this.tokenService.generateRefreshToken();
			const refreshTokenEntity = RefreshTokenEntity.create({
				id: this.idGenerator.generateUuid(),
				userId: user.id,
				deviceId,
				tokenHash: refreshTokenData.tokenHash,
				expiresAt: refreshTokenData.expiresAt,
			});

			await this.refreshTokenRepository.save(refreshTokenEntity);

			this.logger.info(
				{ event: "SESSION_CREATED", userId: user.id, deviceId },
				"Authentication session / refresh token created",
			);

			// 6. Generate Access Token
			const accessToken = this.tokenService.generateAccessToken({
				userId: user.id,
				email: user.email.getValue(),
			});

			this.logger.info(
				{ event: "LOGIN_SUCCESS", userId: user.id },
				"User login successful",
			);

			return {
				user: UserDtoMapper.toLoginResponse(user),
				access_token: accessToken,
				refresh_token: refreshTokenData.token,
			};
		} catch (error) {
			if (error instanceof InvalidCredentialsError) {
				throw error;
			}

			this.logger.error(
				{ err: error, email: normalizedEmail },
				"Unexpected error during login execution",
			);
			throw error;
		}
	}
}
