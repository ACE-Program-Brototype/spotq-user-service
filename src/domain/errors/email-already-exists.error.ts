import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class EmailAlreadyExistsError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.EMAIL_ALREADY_EXISTS;

	constructor(message = DOMAIN_ERRORS.MESSAGES.EMAIL_ALREADY_EXISTS) {
		super(message);
	}
}
