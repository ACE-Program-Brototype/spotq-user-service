import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class InvalidOtpError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.OTP_INVALID;

	constructor(message = DOMAIN_ERRORS.MESSAGES.OTP_INVALID) {
		super(message);
	}
}
