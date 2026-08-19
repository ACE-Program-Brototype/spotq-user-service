import type {
	RefreshTokenDto,
	RefreshTokenResultDto,
} from "@application/dtos/refresh-token.dto.ts";
import type { IUseCase } from "./base.use-case.interface.ts";

export interface IRefreshTokenUseCase
	extends IUseCase<RefreshTokenDto, RefreshTokenResultDto> {}
