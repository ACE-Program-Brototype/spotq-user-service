import type {
	IEmailQueueProducer,
	IOtpService,
	IPasswordHasher,
	ITokenService,
	IIdGenerator,
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
import {
	Email,
	FullName,
	PhoneNumber,
	PlainPassword,
} from "@domain/value-objects/index.ts";
import { logger } from "@infrastructure/logger/logger.ts";
import { inject, injectable } from "inversify";
import type {
	RegisterUserDto,
	RegisterUserResultDto,
} from "../dtos/register-user.dto.ts";

@injectable()
export class RegisterUserUseCase {
	constructor(
		@inject(TYPES.UserRepository)
		private readonly userRepository: IUserRepository,
		@inject(TYPES.PasswordHasher)
		private readonly passwordHasher: IPasswordHasher,
		@inject(TYPES.TokenService)
		private readonly tokenService: ITokenService,
		@inject(TYPES.OtpService)
		private readonly otpService: IOtpService,
		@inject(TYPES.EmailQueueProducer)
		private readonly emailQueueProducer: IEmailQueueProducer,
		@inject(TYPES.IdGenerator)
		private readonly idGenerator: IIdGenerator,
	) {}

	public async execute(dto: RegisterUserDto): Promise<RegisterUserResultDto> {
		// 1. Domain-level value object validations
		const fullName = FullName.create(dto.fullName);
		const email = Email.create(dto.email);
		const phoneNumber = PhoneNumber.create(dto.phoneNumber);
		const plainPassword = PlainPassword.create(dto.password);

		// 2. Application-level uniqueness checks
		const existingEmail = await this.userRepository.findByEmail(email);
		if (existingEmail) {
			throw new EmailAlreadyExistsError();
		}

		const existingPhone = await this.userRepository.findByPhone(phoneNumber);
		if (existingPhone) {
			throw new PhoneAlreadyExistsError();
		}

		// 3. Hash password
		const passwordHash = await this.passwordHasher.hash(plainPassword);

		// 4. Generate identifiers and tokens
		const userId = this.idGenerator.generateUuid();
		const refreshTokenData = this.tokenService.generateRefreshToken();

		let deviceEntity: DeviceEntity | null = null;
		let deviceId: string | null = null;

		if (dto.device) {
			deviceId = this.idGenerator.generateUuid();
			deviceEntity = DeviceEntity.create({
				id: deviceId,
				userId,
				fcmToken: dto.device.fcmToken,
				deviceName: dto.device.deviceName,
				platform: dto.device.platform ?? "WEB",
			});
		}

		const refreshTokenEntity = RefreshTokenEntity.create({
			id: this.idGenerator.generateUuid(),
			userId,
			deviceId,
			tokenHash: refreshTokenData.tokenHash,
			expiresAt: refreshTokenData.expiresAt,
		});

		const userEntity = UserEntity.create({
			id: userId,
			fullName,
			phone: phoneNumber,
			email,
			passwordHash,
		});

		// 5. Database-level atomic transaction for User + Device + Session
		const createdUser = await this.userRepository.createWithSession({
			user: userEntity,
			device: deviceEntity,
			refreshToken: refreshTokenEntity,
		});

		// 6. Generate 6-digit OTP and store SHA-256 hash in Redis
		const otp = await this.otpService.generateAndStoreOtp(email.getValue());

		// 7. Queue email delivery job in BullMQ
		try {
			await this.emailQueueProducer.queueVerificationEmail({
				email: email.getValue(),
				otp,
			});
		} catch (error) {
			// As per story: registration must not be rolled back solely because email queueing fails
			logger.error(
				{ err: error, userId: createdUser.id },
				"Verification email queuing failed after user registration",
			);
		}

		// 8. Generate JWT access token
		const accessToken = this.tokenService.generateAccessToken({
			userId: createdUser.id,
			email: createdUser.email.getValue(),
		});

		// 9. Structured audit logging without logging sensitive credentials
		logger.info(
			{
				userId: createdUser.id,
				event: "USER_REGISTRATION_SUCCESS",
			},
			"User registration successful",
		);

		logger.info(
			{
				userId: createdUser.id,
				event: "REFRESH_TOKEN_CREATED",
			},
			"Initial authentication session created",
		);

		return {
			user: {
				id: createdUser.id,
				fullName: createdUser.fullName.getValue(),
				email: createdUser.email.getValue(),
				phoneNumber: createdUser.phone.getValue(),
				status: createdUser.status,
				createdAt: createdUser.createdAt.toISOString(),
			},
			accessToken,
			refreshToken: refreshTokenData.token,
		};
	}
}
