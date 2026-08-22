import type {
	IIdGenerator,
	ILogger,
	ITokenService,
} from "@application/ports/services/index.ts";
import { TYPES } from "@config/di/types.ts";
import { RefreshTokenEntity } from "@domain/entities/refresh-token.entity.ts";
import { UserStatus } from "@domain/entities/user.entity.ts";
import { InvalidTokenError } from "@domain/errors/index.ts";
import type {
	IRefreshTokenRepository,
	IUserRepository,
} from "@domain/repositories/index.ts";
import type { IRefreshTokenUseCase } from "@ports/use-cases/index.ts";
import { inject, injectable } from "inversify";
import type {
	RefreshTokenDto,
	RefreshTokenResultDto,
} from "../dtos/refresh-token.dto.ts";

@injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
	constructor(
		@inject(TYPES.RefreshTokenRepository)
		private readonly refreshTokenRepository: IRefreshTokenRepository,
		@inject(TYPES.UserRepository)
		private readonly userRepository: IUserRepository,
		@inject(TYPES.TokenService)
		private readonly tokenService: ITokenService,
		@inject(TYPES.IdGenerator)
		private readonly idGenerator: IIdGenerator,
		@inject(TYPES.Logger)
		private readonly logger: ILogger,
	) {}

	public async execute(dto: RefreshTokenDto): Promise<RefreshTokenResultDto> {
		const tokenHash = this.tokenService.hashToken(dto.refreshToken.trim());

		const tokenEntity =
			await this.refreshTokenRepository.findByTokenHash(tokenHash);
		if (!tokenEntity?.isValid()) {
			this.logger.warn(
				{ event: "TOKEN_REFRESH_FAILED" },
				"Refresh token not found or invalid",
			);
			throw new InvalidTokenError("Invalid or expired refresh token.");
		}

		const user = await this.userRepository.findById(tokenEntity.userId);
		if (!user) {
			this.logger.warn(
				{ event: "TOKEN_REFRESH_FAILED", userId: tokenEntity.userId },
				"User associated with refresh token not found",
			);
			throw new InvalidTokenError("User not found.");
		}

		if (user.status === UserStatus.BLOCKED) {
			this.logger.warn(
				{ event: "TOKEN_REFRESH_BLOCKED_ACCOUNT", userId: user.id },
				"Refresh token failed: Account is blocked",
			);
			throw new InvalidTokenError("Account is blocked.");
		}

		if (user.status === UserStatus.INACTIVE) {
			this.logger.warn(
				{ event: "TOKEN_REFRESH_INACTIVE_ACCOUNT", userId: user.id },
				"Refresh token failed: Account is inactive",
			);
			throw new InvalidTokenError("Account is inactive.");
		}

		// Perform refresh token rotation: revoke the old one
		await this.refreshTokenRepository.revoke(tokenHash, new Date());

		// Generate new refresh token
		const newRefreshTokenData = this.tokenService.generateRefreshToken();
		const newRefreshTokenEntity = RefreshTokenEntity.create({
			id: this.idGenerator.generateUuid(),
			userId: user.id,
			deviceId: tokenEntity.deviceId,
			tokenHash: newRefreshTokenData.tokenHash,
			expiresAt: newRefreshTokenData.expiresAt,
		});

		await this.refreshTokenRepository.save(newRefreshTokenEntity);

		// Generate new access token
		const accessToken = this.tokenService.generateAccessToken({
			userId: user.id,
			email: user.email.getValue(),
		});

		this.logger.info(
			{
				userId: user.id,
				event: "TOKEN_REFRESH_SUCCESS",
			},
			"Access token successfully refreshed",
		);

		return {
			accessToken,
			refreshToken: newRefreshTokenData.token,
			user: {
				id: user.id,
				email: user.email.getValue(),
				fullName: user.fullName.getValue(),
				status: user.status,
			},
		};
	}
}
