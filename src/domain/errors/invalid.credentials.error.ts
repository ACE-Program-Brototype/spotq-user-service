import { DomainError } from "./base.error";
import { errorCodes } from "./error.codes";

export class InvalidCredentialsError extends DomainError {
	readonly code = errorCodes.INVALID_CREDENTIALS;

	constructor() {
		super("Invalid credentials.");
	}
}
