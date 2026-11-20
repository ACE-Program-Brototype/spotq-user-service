import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class CustomerNotFoundError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.CUSTOMER_NOT_FOUND;

	constructor(message = DOMAIN_ERRORS.MESSAGES.CUSTOMER_NOT_FOUND) {
		super(message);
	}
}
