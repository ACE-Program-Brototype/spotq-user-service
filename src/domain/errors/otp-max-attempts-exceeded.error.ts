import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class OtpMaxAttemptsExceededError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.OTP_MAX_ATTEMPTS_EXCEEDED;

	constructor(message = DOMAIN_ERRORS.MESSAGES.OTP_MAX_ATTEMPTS_EXCEEDED) {
		super(message);
	}
}
