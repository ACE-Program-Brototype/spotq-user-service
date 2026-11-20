import { DOMAIN_ERRORS } from "@shared/constants/index.ts";
import { DomainError } from "./base.error.ts";

export class UserNotFoundError extends DomainError {
	readonly code = DOMAIN_ERRORS.CODES.USER_NOT_FOUND;

	constructor(message = DOMAIN_ERRORS.MESSAGES.USER_NOT_FOUND) {
		super(message);
	}
}
