import type { LogoutDto, LogoutResultDto } from "@dtos/logout.dto.ts";
import type { IUseCase } from "./base.use-case.interface.ts";

export interface ILogoutUseCase extends IUseCase<LogoutDto, LogoutResultDto> {}
