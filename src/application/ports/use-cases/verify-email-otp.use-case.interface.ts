import type {
	VerifyEmailOtpDto,
	VerifyEmailOtpResultDto,
} from "@dtos/verify-email-otp.dto.ts";
import type { IUseCase } from "./base.use-case.interface.ts";

export interface IVerifyEmailOtpUseCase
	extends IUseCase<VerifyEmailOtpDto, VerifyEmailOtpResultDto> {}
