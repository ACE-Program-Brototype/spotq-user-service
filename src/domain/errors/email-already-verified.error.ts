import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class EmailAlreadyVerifiedError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.EMAIL_ALREADY_VERIFIED;

	constructor(message = DOMAIN_ERRORS.MESSAGES.EMAIL_ALREADY_VERIFIED) {
		super(message);
	}
}
