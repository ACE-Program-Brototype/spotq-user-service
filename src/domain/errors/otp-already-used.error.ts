import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class OtpAlreadyUsedError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.OTP_ALREADY_USED;

	constructor(message = DOMAIN_ERRORS.MESSAGES.OTP_ALREADY_USED) {
		super(message);
	}
}
