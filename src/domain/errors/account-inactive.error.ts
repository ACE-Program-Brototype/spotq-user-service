import { DomainError } from "./base.error.ts";

export class AccountInactiveError extends DomainError {
	readonly code = "ACCOUNT_INACTIVE";

	constructor(message = "Your account is inactive.") {
		super(message);
	}
}
