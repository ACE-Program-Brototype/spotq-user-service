import type {
	IEmailQueueProducer,
	IIdGenerator,
	ILogger,
	IOtpService,
	IPasswordHasher,
} from "@application/ports/services/index.ts";
import { TYPES } from "@config/di/types.ts";
import { UserEntity } from "@domain/entities/user.entity.ts";
import {
	EmailAlreadyExistsError,
	PhoneAlreadyExistsError,
} from "@domain/errors/domain.error.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { PlainPassword } from "@domain/value-objects/index.ts";
import type { IRegisterUserUseCase } from "@ports/use-cases/index.ts";
import { inject, injectable } from "inversify";
import type { RegisterUserDto } from "../dtos/register-user.dto.ts";

@injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {
	constructor(
		@inject(TYPES.UserRepository)
		private readonly userRepository: IUserRepository,
		@inject(TYPES.PasswordHasher)
		private readonly passwordHasher: IPasswordHasher,
		@inject(TYPES.OtpService)
		private readonly otpService: IOtpService,
		@inject(TYPES.EmailQueueProducer)
		private readonly emailQueueProducer: IEmailQueueProducer,
		@inject(TYPES.IdGenerator)
		private readonly idGenerator: IIdGenerator,
		@inject(TYPES.Logger)
		private readonly logger: ILogger,
	) {}

	public async execute(dto: RegisterUserDto): Promise<void> {
		// 1. Domain-level value object validations
		const plainPassword = PlainPassword.create(dto.password);

		// 2. Application-level uniqueness checks
		const existingEmail = await this.userRepository.findByEmail(dto.email);
		if (existingEmail) {
			throw new EmailAlreadyExistsError();
		}

		const existingPhone = await this.userRepository.findByPhone(
			dto.phoneNumber,
		);
		if (existingPhone) {
			throw new PhoneAlreadyExistsError();
		}

		// 3. Hash password
		const passwordHash = await this.passwordHasher.hash(plainPassword);

		// 4. Generate user identifier
		const userId = this.idGenerator.generateUuid();

		const userEntity = UserEntity.create({
			id: userId,
			fullName: dto.fullName,
			phone: dto.phoneNumber,
			email: dto.email,
			passwordHash,
		});

		// 5. Database-level user creation (without session/tokens)
		const createdUser = await this.userRepository.create(userEntity);

		// 6. Generate 6-digit OTP and store SHA-256 hash in Redis
		const otp = await this.otpService.generateAndStoreOtp(dto.email);

		// 7. Queue email delivery job in BullMQ
		try {
			await this.emailQueueProducer.queueVerificationEmail({
				email: dto.email,
				otp,
			});
		} catch (error) {
			// Registration must not be rolled back solely because email queueing fails
			this.logger.error(
				{ err: error, userId: createdUser.id },
				"Verification email queuing failed after user registration",
			);
		}

		// 8. Structured audit logging without logging sensitive credentials
		this.logger.info(
			{
				userId: createdUser.id,
				event: "USER_REGISTRATION_SUCCESS",
			},
			"User registration successful",
		);
	}
}
