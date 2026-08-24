import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class InvalidPhoneNumberError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.INVALID_PHONE_NUMBER;

	constructor(message = DOMAIN_ERRORS.MESSAGES.INVALID_PHONE_NUMBER) {
		super(message);
	}
}
