import type {
	ResendEmailOtpDto,
	ResendEmailOtpResultDto,
} from "@dtos/resend-email-otp.dto.ts";
import type { IUseCase } from "./base.use-case.interface.ts";

export interface IResendEmailOtpUseCase
	extends IUseCase<ResendEmailOtpDto, ResendEmailOtpResultDto> {}
