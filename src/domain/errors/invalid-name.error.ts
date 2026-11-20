import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class InvalidNameError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.INVALID_NAME;

	constructor(message = DOMAIN_ERRORS.MESSAGES.INVALID_NAME) {
		super(message);
	}
}
