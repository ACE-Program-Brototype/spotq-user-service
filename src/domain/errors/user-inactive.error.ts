import { DomainError } from "./base.error.ts";

export class UserInactiveError extends DomainError {
	readonly code = "USER_INACTIVE";

	constructor(message = "Your account is inactive.") {
		super(message);
	}
}
