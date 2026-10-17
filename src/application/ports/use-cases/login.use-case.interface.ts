import type { LoginDto, LoginResultDto } from "@application/dtos/login.dto.ts";
import type { IUseCase } from "./base.use-case.interface.ts";

export interface ILoginUseCase extends IUseCase<LoginDto, LoginResultDto> {}
