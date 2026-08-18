import type { ITokenService } from "@application/ports/services/token-service.interface.ts";
import { TYPES } from "@config/di/types.ts";
import type { ILogoutUseCase } from "@ports/use-cases/index.ts";
import type { IRefreshTokenRepository } from "@domain/repositories/refresh-token.repository.interface.ts";
import { logger } from "@infrastructure/logger/logger.ts";
import { ResponseMessage } from "@shared/constants/index.ts";
import { inject, injectable } from "inversify";
import type { LogoutDto, LogoutResultDto } from "../dtos/logout.dto.ts";

@injectable()
export class LogoutUseCase implements ILogoutUseCase {
	constructor(
		@inject(TYPES.RefreshTokenRepository)
		private readonly _refreshTokenRepository: IRefreshTokenRepository,
		@inject(TYPES.TokenService)
		private readonly _tokenService: ITokenService,
	) {}

	public async execute(dto: LogoutDto): Promise<LogoutResultDto> {
		if (dto.refreshToken) {
			const tokenHash = this._tokenService.hashToken(dto.refreshToken.trim());
			await this._refreshTokenRepository.revoke(tokenHash, new Date());
		}

		logger.info(
			{
				userId: dto.userId,
				event: "USER_LOGOUT",
			},
			"User logged out successfully",
		);

		logger.info(
			{
				userId: dto.userId,
				event: "REFRESH_TOKEN_REVOKED",
			},
			"Refresh token session revoked",
		);

		return {
			success: true,
			message: ResponseMessage.LOGOUT_SUCCESS,
		};
	}
}
