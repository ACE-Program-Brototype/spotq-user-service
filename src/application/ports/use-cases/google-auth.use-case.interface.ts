import type {
	GoogleAuthDto,
	GoogleAuthResultDto,
} from "@application/dtos/google-auth.dto.ts";
import type { IUseCase } from "./base.use-case.interface.ts";

export interface IGoogleAuthUseCase
	extends IUseCase<GoogleAuthDto, GoogleAuthResultDto> {}
