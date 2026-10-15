import type {
	ILogger,
	ITokenService,
} from "@application/ports/services/index.ts";
import { TYPES } from "@config/di/types.ts";
import type { IDeviceRepository } from "@domain/repositories/device.repository.interface.ts";
import type { IRefreshTokenRepository } from "@domain/repositories/refresh-token.repository.interface.ts";
import type { ILogoutUseCase } from "@ports/use-cases/index.ts";
import { ResponseMessage } from "@shared/constants/index.ts";
import { inject, injectable, optional } from "inversify";
import type { LogoutDto, LogoutResultDto } from "../dtos/logout.dto.ts";

@injectable()
export class LogoutUseCase implements ILogoutUseCase {
	constructor(
		@inject(TYPES.RefreshTokenRepository)
		private readonly refreshTokenRepository: IRefreshTokenRepository,
		@inject(TYPES.TokenService)
		private readonly tokenService: ITokenService,
		@inject(TYPES.Logger)
		private readonly logger: ILogger,
		@inject(TYPES.DeviceRepository)
		@optional()
		private readonly deviceRepository?: IDeviceRepository,
	) {}

	public async execute(dto: LogoutDto): Promise<LogoutResultDto> {
		if (dto.refreshToken) {
			const tokenHash = this.tokenService.hashToken(dto.refreshToken.trim());
			await this.refreshTokenRepository.revoke(tokenHash, new Date());
		}

		if (dto.deviceId && this.deviceRepository) {
			await this.deviceRepository.deactivate(dto.userId, dto.deviceId);
			this.logger.info(
				{
					userId: dto.userId,
					deviceId: dto.deviceId,
					event: "DEVICE_DEACTIVATED_ON_LOGOUT",
				},
				"Device deactivated on logout",
			);
		}

		this.logger.info(
			{
				userId: dto.userId,
				event: "USER_LOGOUT",
			},
			"User logged out successfully",
		);

		this.logger.info(
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
