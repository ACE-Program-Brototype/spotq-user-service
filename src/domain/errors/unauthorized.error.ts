import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class UnauthorizedError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.UNAUTHORIZED;

	constructor(message = DOMAIN_ERRORS.MESSAGES.UNAUTHORIZED) {
		super(message);
	}
}
