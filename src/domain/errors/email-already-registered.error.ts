import { DomainError } from "./base.error.ts";

export class EmailAlreadyRegisteredError extends DomainError {
	readonly code = "EMAIL_ALREADY_REGISTERED";

	constructor(
		message = "An account with this email already exists. Please sign in using your email and password.",
	) {
		super(message);
	}
}
