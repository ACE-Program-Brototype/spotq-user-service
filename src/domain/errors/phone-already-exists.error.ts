import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class PhoneAlreadyExistsError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.PHONE_ALREADY_EXISTS;

	constructor(message = DOMAIN_ERRORS.MESSAGES.PHONE_ALREADY_EXISTS) {
		super(message);
	}
}
