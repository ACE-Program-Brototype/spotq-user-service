import { DomainError } from "./base.error";

export class ResetPasswordFailedError extends DomainError {
	readonly code = "RESET_PASSWORD_FAILED";

	constructor() {
		super("Unable to reset password.");
	}
}
