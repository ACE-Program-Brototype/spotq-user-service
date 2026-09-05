import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class EmailNotVerifiedError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.EMAIL_NOT_VERIFIED;

	constructor(message = DOMAIN_ERRORS.MESSAGES.EMAIL_NOT_VERIFIED) {
		super(message);
	}
}
