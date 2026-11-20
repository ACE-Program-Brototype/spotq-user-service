import { DomainError } from "./base.error.ts";

export class AccountBlockedError extends DomainError {
	readonly code = "ACCOUNT_BLOCKED";

	constructor(message = "Your account has been blocked.") {
		super(message);
	}
}
