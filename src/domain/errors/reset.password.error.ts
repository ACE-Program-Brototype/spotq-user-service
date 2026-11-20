import { DomainError } from "./base.error";
import { errorCodes } from "./error.codes";

export class ResetPasswordFailedError extends DomainError {
	readonly code = errorCodes.RESET_PASSWORD_FAILED;

	constructor() {
		super("Unable to reset password.");
	}
}
