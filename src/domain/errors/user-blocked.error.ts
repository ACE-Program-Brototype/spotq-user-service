import { DomainError } from "./base.error.ts";

export class UserBlockedError extends DomainError {
	readonly code = "USER_BLOCKED";

	constructor(
		message = "Your account has been blocked. Please contact support.",
	) {
		super(message);
	}
}
