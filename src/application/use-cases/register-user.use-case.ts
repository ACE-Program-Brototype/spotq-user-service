import type {
	IEmailQueueProducer,
	IIdGenerator,
	ILogger,
	IOtpService,
	IPasswordHasher,
	ITokenService,
} from "@application/ports/services/index.ts";
import { TYPES } from "@config/di/types.ts";
import { DeviceEntity } from "@domain/entities/device.entity.ts";
import { RefreshTokenEntity } from "@domain/entities/refresh-token.entity.ts";
import { UserEntity } from "@domain/entities/user.entity.ts";
import {
	EmailAlreadyExistsError,
	PhoneAlreadyExistsError,
} from "@domain/errors/domain.error.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { PlainPassword } from "@domain/value-objects/index.ts";
import type { IRegisterUserUseCase } from "@ports/use-cases/index.ts";
import { inject, injectable } from "inversify";
import type {
	RegisterUserDto,
	RegisterUserResultDto,
} from "../dtos/register-user.dto.ts";
import { UserDtoMapper } from "../mappers/user-dto.mapper.ts";

@injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {
	constructor(
		@inject(TYPES.UserRepository)
		private readonly _userRepository: IUserRepository,
		@inject(TYPES.PasswordHasher)
		private readonly _passwordHasher: IPasswordHasher,
		@inject(TYPES.TokenService)
		private readonly _tokenService: ITokenService,
		@inject(TYPES.OtpService)
		private readonly _otpService: IOtpService,
		@inject(TYPES.EmailQueueProducer)
		private readonly _emailQueueProducer: IEmailQueueProducer,
		@inject(TYPES.IdGenerator)
		private readonly _idGenerator: IIdGenerator,
		@inject(TYPES.Logger)
		private readonly _logger: ILogger,
	) {}

	public async execute(dto: RegisterUserDto): Promise<RegisterUserResultDto> {
		// 1. Domain-level value object validations
		const plainPassword = PlainPassword.create(dto.password);

		// 2. Application-level uniqueness checks
		const existingEmail = await this._userRepository.findByEmail(dto.email);
		if (existingEmail) {
			throw new EmailAlreadyExistsError();
		}

		const existingPhone = await this._userRepository.findByPhone(
			dto.phoneNumber,
		);
		if (existingPhone) {
			throw new PhoneAlreadyExistsError();
		}

		// 3. Hash password
		const passwordHash = await this._passwordHasher.hash(plainPassword);

		// 4. Generate identifiers and tokens
		const userId = this._idGenerator.generateUuid();
		const refreshTokenData = this._tokenService.generateRefreshToken();

		let deviceEntity: DeviceEntity | null = null;
		let deviceId: string | null = null;

		if (dto.device) {
			deviceId = this._idGenerator.generateUuid();
			deviceEntity = DeviceEntity.create({
				id: deviceId,
				userId,
				fcmToken: dto.device.fcmToken,
				deviceName: dto.device.deviceName,
				platform: dto.device.platform ?? "WEB",
			});
		}

		const refreshTokenEntity = RefreshTokenEntity.create({
			id: this._idGenerator.generateUuid(),
			userId,
			deviceId,
			tokenHash: refreshTokenData.tokenHash,
			expiresAt: refreshTokenData.expiresAt,
		});

		const userEntity = UserEntity.create({
			id: userId,
			fullName: dto.fullName,
			phone: dto.phoneNumber,
			email: dto.email,
			passwordHash,
		});

		// 5. Database-level atomic transaction for User + Device + Session
		const createdUser = await this._userRepository.createWithSession({
			user: userEntity,
			device: deviceEntity,
			refreshToken: refreshTokenEntity,
		});

		// 6. Generate 6-digit OTP and store SHA-256 hash in Redis
		const otp = await this._otpService.generateAndStoreOtp(dto.email);

		// 7. Queue email delivery job in BullMQ
		try {
			await this._emailQueueProducer.queueVerificationEmail({
				email: dto.email,
				otp,
			});
		} catch (error) {
			// As per story: registration must not be rolled back solely because email queueing fails
			this._logger.error(
				{ err: error, userId: createdUser.id },
				"Verification email queuing failed after user registration",
			);
		}

		// 8. Generate JWT access token
		const accessToken = this._tokenService.generateAccessToken({
			userId: createdUser.id,
			email: createdUser.email.getValue(),
		});

		// 9. Structured audit logging without logging sensitive credentials
		this._logger.info(
			{
				userId: createdUser.id,
				event: "USER_REGISTRATION_SUCCESS",
			},
			"User registration successful",
		);

		this._logger.info(
			{
				userId: createdUser.id,
				event: "REFRESH_TOKEN_CREATED",
			},
			"Initial authentication session created",
		);

		return {
			user: UserDtoMapper.toRegisteredUserResponse(createdUser),
			accessToken,
			refreshToken: refreshTokenData.token,
		};
	}
}
