import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class OtpExpiredError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.OTP_EXPIRED;

	constructor(message = DOMAIN_ERRORS.MESSAGES.OTP_EXPIRED) {
		super(message);
	}
}
