import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class InvalidPasswordError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.INVALID_PASSWORD;

	constructor(message = DOMAIN_ERRORS.MESSAGES.INVALID_PASSWORD) {
		super(message);
	}
}
