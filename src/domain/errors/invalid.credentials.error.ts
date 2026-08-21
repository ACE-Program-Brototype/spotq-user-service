import { DomainError } from "./base.error";

export class InvalidCredentialsError extends DomainError {
	readonly code = "INVALID_CREDENTIALS";

	constructor() {
		super("Invalid credentials.");
	}
}