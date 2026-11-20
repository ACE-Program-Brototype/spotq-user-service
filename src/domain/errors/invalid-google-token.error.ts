import { DomainError } from "./base.error.ts";

export class InvalidGoogleTokenError extends DomainError {
	readonly code = "INVALID_GOOGLE_TOKEN";

	constructor(message = "Google authentication is invalid. Please try again.") {
		super(message);
	}
}
