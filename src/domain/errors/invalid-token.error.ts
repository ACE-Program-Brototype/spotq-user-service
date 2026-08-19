import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class InvalidTokenError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.INVALID_TOKEN;

	constructor(message = DOMAIN_ERRORS.MESSAGES.INVALID_TOKEN) {
		super(message);
	}
}
