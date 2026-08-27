import type {
	IGoogleAuthService,
	IIdGenerator,
	ILogger,
} from "@application/ports/services/index.ts";
import type { ITokenService } from "@application/ports/services/token-service.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { DeviceEntity } from "@domain/entities/device.entity.ts";
import { RefreshTokenEntity } from "@domain/entities/refresh-token.entity.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import { UserProfileEntity } from "@domain/entities/user-profile.entity.ts";
import { UserBlockedError } from "@domain/errors/domain.error.ts";
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
		private readonly userRepository: IUserRepository,
		@inject(TYPES.TokenService)
		private readonly tokenService: ITokenService,
		@inject(TYPES.GoogleAuthService)
		private readonly googleAuthService: IGoogleAuthService,
		@inject(TYPES.DeviceRepository)
		private readonly deviceRepository: IDeviceRepository,
		@inject(TYPES.RefreshTokenRepository)
		private readonly refreshTokenRepository: IRefreshTokenRepository,
		@inject(TYPES.IdGenerator)
		private readonly idGenerator: IIdGenerator,
		@inject(TYPES.Logger)
		private readonly logger: ILogger,
	) {}

	public async execute(dto: GoogleAuthDto): Promise<GoogleAuthResultDto> {
		// 1. Verify Google ID token
		const googlePayload = await this.googleAuthService.verifyIdToken(
			dto.idToken,
		);

		// Normalize Google email
		const normalizedEmailString = googlePayload.email.trim().toLowerCase();
		const emailObj = Email.create(normalizedEmailString);

		// Check if user already exists by googleId (immutable sub)
		const existingUserByGoogleId = await this.userRepository.findByGoogleId(
			googlePayload.sub,
		);
		let isNewUser = false;
		let finalUser!: UserEntity;

		if (existingUserByGoogleId) {
			finalUser = existingUserByGoogleId;
			// Account exists. Validate account status
			if (finalUser.status !== UserStatus.ACTIVE) {
				this.logger.warn(
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
				await this.userRepository.findByEmail(emailObj);

			if (existingUserByEmail) {
				// Email exists, but googleId is not mapped and user has password-based account
				if (existingUserByEmail.passwordHash !== null) {
					this.logger.info(
						{
							email: normalizedEmailString,
							userId: existingUserByEmail.id,
							event: "GOOGLE_ACCOUNT_LINK_START",
						},
						"Linking Google ID to existing password-based account",
					);
					existingUserByEmail.linkGoogleAccount(googlePayload.sub);
					await this.userRepository.update(
						existingUserByEmail.id,
						existingUserByEmail,
					);
					this.logger.info(
						{
							email: normalizedEmailString,
							userId: existingUserByEmail.id,
							event: "GOOGLE_ACCOUNT_LINK_SUCCESS",
						},
						"Google account linked successfully to existing password-based account",
					);
				}
				// Re-assign to finalUser
				finalUser = existingUserByEmail;
			} else {
				isNewUser = true;
			}
		}

		const deviceData = dto.device;
		let deviceEntity: DeviceEntity | null = null;
		let deviceId: string | null = null;
		const refreshTokenData = this.tokenService.generateRefreshToken();

		if (isNewUser) {
			const userId = this.idGenerator.generateUuid();
			const fullName = FullName.create(googlePayload.name);

			if (deviceData) {
				deviceId = this.idGenerator.generateUuid();
				deviceEntity = DeviceEntity.create({
					id: deviceId,
					userId,
					fcmToken: deviceData.fcmToken,
					deviceName: deviceData.deviceName,
					platform: deviceData.platform ?? "WEB",
				});
			}

			const profileEntity = UserProfileEntity.create({
				id: this.idGenerator.generateUuid(),
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
				id: this.idGenerator.generateUuid(),
				userId,
				deviceId,
				tokenHash: refreshTokenData.tokenHash,
				expiresAt: refreshTokenData.expiresAt,
			});

			// Atomically create User + Profile + Device + RefreshToken Session
			finalUser = await this.userRepository.createWithSession({
				user: userEntity,
				device: deviceEntity,
				refreshToken: refreshTokenEntity,
			});

			this.logger.info(
				{ userId: finalUser.id, event: "GOOGLE_REGISTRATION_SUCCESS" },
				"Google user registered successfully",
			);
		} else {
			// Existing Google User login
			// Handle device registration / update
			if (deviceData?.platform) {
				const existingDevice =
					await this.deviceRepository.findByUserIdAndPlatform(
						finalUser.id,
						deviceData.platform,
					);

				if (existingDevice) {
					existingDevice.updateFcmToken(deviceData.fcmToken ?? null);
					existingDevice.updateLastLogin();
					await this.deviceRepository.save(existingDevice);
					deviceId = existingDevice.id;
				} else {
					deviceId = this.idGenerator.generateUuid();
					const newDevice = DeviceEntity.create({
						id: deviceId,
						userId: finalUser.id,
						fcmToken: deviceData.fcmToken,
						deviceName: deviceData.deviceName,
						platform: deviceData.platform,
					});
					await this.deviceRepository.save(newDevice);
					deviceId = newDevice.id;
				}
			}

			const refreshTokenEntity = RefreshTokenEntity.create({
				id: this.idGenerator.generateUuid(),
				userId: finalUser.id,
				deviceId,
				tokenHash: refreshTokenData.tokenHash,
				expiresAt: refreshTokenData.expiresAt,
			});

			await this.refreshTokenRepository.save(refreshTokenEntity);

			this.logger.info(
				{ userId: finalUser.id, event: "GOOGLE_AUTH_SUCCESS" },
				"Google user authenticated successfully",
			);
		}

		this.logger.info(
			{ userId: finalUser.id, event: "REFRESH_TOKEN_CREATED" },
			"Google auth session created",
		);

		// Generate access token
		const accessToken = this.tokenService.generateAccessToken({
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
