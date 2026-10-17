import type {
	VerifyEmailOtpDto,
	VerifyEmailOtpResultDto,
} from "@application/dtos/verify-email-otp.dto.ts";
import { UserDtoMapper } from "@application/mappers/user-dto.mapper.ts";
import type {
	IIdGenerator,
	ILogger,
	IOtpService,
} from "@application/ports/services/index.ts";
import type { ITokenService } from "@application/ports/services/token-service.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { RefreshTokenEntity } from "@domain/entities/refresh-token.entity.ts";
import {
	InvalidOtpError,
	UserNotFoundError,
} from "@domain/errors/domain.error.ts";
import type {
	IRefreshTokenRepository,
	IUserRepository,
} from "@domain/repositories/index.ts";
import { Email } from "@domain/value-objects/email.vo.ts";
import type { IVerifyEmailOtpUseCase } from "@ports/use-cases/index.ts";
import { REGEX } from "@shared/constants/index.ts";
import { inject, injectable } from "inversify";

@injectable()
export class VerifyEmailOtpUseCase implements IVerifyEmailOtpUseCase {
	constructor(
		@inject(TYPES.UserRepository)
		private readonly userRepository: IUserRepository,
		@inject(TYPES.RefreshTokenRepository)
		private readonly refreshTokenRepository: IRefreshTokenRepository,
		@inject(TYPES.TokenService)
		private readonly tokenService: ITokenService,
		@inject(TYPES.OtpService)
		private readonly otpService: IOtpService,
		@inject(TYPES.IdGenerator)
		private readonly idGenerator: IIdGenerator,
		@inject(TYPES.Logger)
		private readonly logger: ILogger,
	) {}

	public async execute(
		dto: VerifyEmailOtpDto,
	): Promise<VerifyEmailOtpResultDto> {
		const email = Email.create(dto.email);

		if (!dto.otp || !REGEX.OTP.test(dto.otp.trim())) {
			throw new InvalidOtpError("OTP must be exactly 6 digits.");
		}

		await this.otpService.verifyOtp(email.getValue(), dto.otp.trim());

		const user = await this.userRepository.findByEmail(email.getValue());
		if (!user) {
			throw new UserNotFoundError();
		}

		user.markEmailAsVerified();
		await this.userRepository.update(user.id, user);

		const refreshTokenData = this.tokenService.generateRefreshToken();
		const refreshTokenEntity = RefreshTokenEntity.create({
			id: this.idGenerator.generateUuid(),
			userId: user.id,
			tokenHash: refreshTokenData.tokenHash,
			expiresAt: refreshTokenData.expiresAt,
		});

		await this.refreshTokenRepository.save(refreshTokenEntity);

		const accessToken = this.tokenService.generateAccessToken({
			userId: user.id,
			email: user.email.getValue(),
		});

		this.logger.info(
			{
				userId: user.id,
				email: email.getValue(),
				event: "EMAIL_OTP_VERIFICATION_SUCCESS",
			},
			"Email OTP verified successfully",
		);

		this.logger.info(
			{
				userId: user.id,
				event: "REFRESH_TOKEN_CREATED",
			},
			"Authentication session created upon email verification",
		);

		return {
			user: UserDtoMapper.toVerifiedUserResponse(user),
			accessToken,
			refreshToken: refreshTokenData.token,
		};
	}
}
