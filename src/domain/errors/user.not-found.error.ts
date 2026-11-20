import { DomainError } from "./base.error";
import { errorCodes } from "./error.codes";

export class UserNotFoundError extends DomainError {
	readonly code = errorCodes.USER_NOT_FOUND;

	constructor() {
		super("User not found.");
	}
}
