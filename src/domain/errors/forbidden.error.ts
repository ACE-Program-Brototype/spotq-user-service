import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class ForbiddenError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.FORBIDDEN;

	constructor(message = DOMAIN_ERRORS.MESSAGES.CUSTOMER_ONLY_ACCESS) {
		super(message);
	}
}
