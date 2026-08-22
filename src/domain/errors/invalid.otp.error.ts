import { DomainError } from "./base.error";
import { errorCodes } from "./error.codes";

export class InvalidOtpError extends DomainError {
	readonly code = errorCodes.INVALID_OTP;

	constructor() {
		super("OTP is invalid.");
	}
}
