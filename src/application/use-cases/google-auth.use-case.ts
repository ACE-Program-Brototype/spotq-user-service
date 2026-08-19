import type {
	IGoogleAuthService,
	IIdGenerator,
	ILogger,
	ITokenService,
} from "@application/ports/services/index.ts";
import { TYPES } from "@config/di/types.ts";
import { DeviceEntity } from "@domain/entities/device.entity.ts";
import { RefreshTokenEntity } from "@domain/entities/refresh-token.entity.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import { UserProfileEntity } from "@domain/entities/user-profile.entity.ts";
import {
	EmailAlreadyRegisteredError,
	UserBlockedError,
} from "@domain/errors/domain.error.ts";
import type {
	IDeviceRepository,
	IRefreshTokenRepository,
	IUserRepository,
} from "@domain/repositories/index.ts";
import { Email, FullName } from "@domain/value-objects/index.ts";
import type { IGoogleAuthUseCase } from "@ports/use-cases/index.ts";
import { inject, injectable } from "inversify";
import type {
	GoogleAuthDto,
	GoogleAuthResultDto,
} from "../dtos/google-auth.dto.ts";
import { UserDtoMapper } from "../mappers/user-dto.mapper.ts";

@injectable()
export class GoogleAuthUseCase implements IGoogleAuthUseCase {
	constructor(
		@inject(TYPES.UserRepository)
		private readonly _userRepository: IUserRepository,
		@inject(TYPES.TokenService)
		private readonly _tokenService: ITokenService,
		@inject(TYPES.GoogleAuthService)
		private readonly _googleAuthService: IGoogleAuthService,
		@inject(TYPES.DeviceRepository)
		private readonly _deviceRepository: IDeviceRepository,
		@inject(TYPES.RefreshTokenRepository)
		private readonly _refreshTokenRepository: IRefreshTokenRepository,
		@inject(TYPES.IdGenerator)
		private readonly _idGenerator: IIdGenerator,
		@inject(TYPES.Logger)
		private readonly _logger: ILogger,
	) {}

	public async execute(dto: GoogleAuthDto): Promise<GoogleAuthResultDto> {
		// 1. Verify Google ID token
		const googlePayload = await this._googleAuthService.verifyIdToken(
			dto.idToken,
		);

		// Normalize Google email
		const normalizedEmailString = googlePayload.email.trim().toLowerCase();
		const emailObj = Email.create(normalizedEmailString);

		// Check if user already exists by googleId (immutable sub)
		const existingUserByGoogleId = await this._userRepository.findByGoogleId(
			googlePayload.sub,
		);
		let isNewUser = false;
		let finalUser!: UserEntity;

		if (existingUserByGoogleId) {
			finalUser = existingUserByGoogleId;
			// Account exists. Validate account status
			if (finalUser.status !== UserStatus.ACTIVE) {
				this._logger.warn(
					{
						userId: finalUser.id,
						status: finalUser.status,
						event: "GOOGLE_AUTH_FAILURE",
					},
					"Google authentication rejected due to inactive/blocked user status",
				);
				throw new UserBlockedError(
					"Google authentication failed. Account is not active.",
				);
			}
		} else {
			// 2. Google ID doesn't exist, check email
			const existingUserByEmail =
				await this._userRepository.findByEmail(emailObj);

			if (existingUserByEmail) {
				// Email exists, but googleId is not mapped and user has password-based account
				if (existingUserByEmail.passwordHash !== null) {
					this._logger.warn(
						{
							email: normalizedEmailString,
							event: "GOOGLE_EMAIL_ALREADY_REGISTERED",
						},
						"Google login conflict: email already registered with password",
					);
					throw new EmailAlreadyRegisteredError();
				}
				// Re-assign to finalUser if they exist without password (e.g. registered via alternative OAuth method or manually created without password)
				finalUser = existingUserByEmail;
			} else {
				isNewUser = true;
			}
		}

		const deviceData = dto.device;
		let deviceEntity: DeviceEntity | null = null;
		let deviceId: string | null = null;
		const refreshTokenData = this._tokenService.generateRefreshToken();

		if (isNewUser) {
			const userId = this._idGenerator.generateUuid();
			const fullName = FullName.create(googlePayload.name);

			if (deviceData) {
				deviceId = this._idGenerator.generateUuid();
				deviceEntity = DeviceEntity.create({
					id: deviceId,
					userId,
					fcmToken: deviceData.fcmToken,
					deviceName: deviceData.deviceName,
					platform: deviceData.platform ?? "WEB",
				});
			}

			const profileEntity = UserProfileEntity.create({
				id: this._idGenerator.generateUuid(),
				userId,
				avatarUrl: googlePayload.picture,
			});

			const userEntity = UserEntity.create({
				id: userId,
				fullName,
				phone: null,
				email: emailObj,
				passwordHash: null,
				googleId: googlePayload.sub,
				profile: profileEntity,
			});

			const refreshTokenEntity = RefreshTokenEntity.create({
				id: this._idGenerator.generateUuid(),
				userId,
				deviceId,
				tokenHash: refreshTokenData.tokenHash,
				expiresAt: refreshTokenData.expiresAt,
			});

			// Atomically create User + Profile + Device + RefreshToken Session
			finalUser = await this._userRepository.createWithSession({
				user: userEntity,
				device: deviceEntity,
				refreshToken: refreshTokenEntity,
			});

			this._logger.info(
				{ userId: finalUser.id, event: "GOOGLE_REGISTRATION_SUCCESS" },
				"Google user registered successfully",
			);
		} else {
			// Existing Google User login
			// Handle device registration / update
			if (deviceData?.platform) {
				const existingDevice =
					await this._deviceRepository.findByUserIdAndPlatform(
						finalUser.id,
						deviceData.platform,
					);

				if (existingDevice) {
					existingDevice.updateFcmToken(deviceData.fcmToken ?? null);
					existingDevice.updateLastLogin();
					await this._deviceRepository.save(existingDevice);
					deviceId = existingDevice.id;
				} else {
					deviceId = this._idGenerator.generateUuid();
					const newDevice = DeviceEntity.create({
						id: deviceId,
						userId: finalUser.id,
						fcmToken: deviceData.fcmToken,
						deviceName: deviceData.deviceName,
						platform: deviceData.platform,
					});
					await this._deviceRepository.save(newDevice);
					deviceId = newDevice.id;
				}
			}

			const refreshTokenEntity = RefreshTokenEntity.create({
				id: this._idGenerator.generateUuid(),
				userId: finalUser.id,
				deviceId,
				tokenHash: refreshTokenData.tokenHash,
				expiresAt: refreshTokenData.expiresAt,
			});

			await this._refreshTokenRepository.save(refreshTokenEntity);

			this._logger.info(
				{ userId: finalUser.id, event: "GOOGLE_AUTH_SUCCESS" },
				"Google user authenticated successfully",
			);
		}

		this._logger.info(
			{ userId: finalUser.id, event: "REFRESH_TOKEN_CREATED" },
			"Google auth session created",
		);

		// Generate access token
		const accessToken = this._tokenService.generateAccessToken({
			userId: finalUser.id,
			email: finalUser.email.getValue(),
		});

		return {
			user: UserDtoMapper.toGoogleAuthUserResponse(finalUser),
			accessToken,
			refreshToken: refreshTokenData.token,
		};
	}
}
