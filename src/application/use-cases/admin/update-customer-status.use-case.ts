import type {
	UpdateCustomerStatusDto,
	UpdateCustomerStatusResponseDto,
} from "@application/dtos/admin/update-customer-status.dto.ts";
import type { IUpdateCustomerStatusUseCase } from "@application/ports/use-cases/admin/update-customer-status.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { UserNotFoundError } from "@domain/errors/domain.error.ts";
import type { IRefreshTokenRepository } from "@domain/repositories/refresh-token.repository.interface.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { inject, injectable } from "inversify";

@injectable()
export class UpdateCustomerStatusUseCase
	implements IUpdateCustomerStatusUseCase
{
	constructor(
		@inject(TYPES.UserRepository)
		private readonly userRepository: IUserRepository,
		@inject(TYPES.RefreshTokenRepository)
		private readonly refreshTokenRepository: IRefreshTokenRepository,
	) {}

	public async execute(
		dto: UpdateCustomerStatusDto,
	): Promise<UpdateCustomerStatusResponseDto> {
		const existingUser = await this.userRepository.findById(dto.userId);
		if (!existingUser) {
			throw new UserNotFoundError();
		}

		if (existingUser.status === dto.status) {
			return {
				id: existingUser.id,
				status: existingUser.status,
				updatedAt: existingUser.updatedAt.toISOString(),
			};
		}

		const updatedUser = await this.userRepository.updateStatus(
			dto.userId,
			dto.status,
		);

		if (dto.status === "BLOCKED" || dto.status === "INACTIVE") {
			await this.refreshTokenRepository.revokeAllForUser(dto.userId);
		}

		return {
			id: updatedUser.id,
			status: updatedUser.status,
			updatedAt: updatedUser.updatedAt.toISOString(),
		};
	}
}
