import { DomainError } from "./base.error.ts";

export class InvalidCredentialsError extends DomainError {
	readonly code = "INVALID_CREDENTIALS";

	constructor(message = "Invalid email or password.") {
		super(message);
	}
}
