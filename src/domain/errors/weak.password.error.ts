import { DomainError } from "./base.error";
import { errorCodes } from "./error.codes";

export class WeakPasswordError extends DomainError {
	readonly code = errorCodes.WEAK_PASSWORD;

	constructor() {
		super("Password is too weak. Please choose a stronger password.");
	}
}