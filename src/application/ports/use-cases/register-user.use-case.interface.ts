import type { RegisterUserDto } from "@dtos/register-user.dto.ts";
import type { IUseCase } from "./base.use-case.interface.ts";

export interface IRegisterUserUseCase extends IUseCase<RegisterUserDto, void> {}
