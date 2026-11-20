import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class InvalidEmailError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.INVALID_EMAIL;

	constructor(message = DOMAIN_ERRORS.MESSAGES.INVALID_EMAIL) {
		super(message);
	}
}
