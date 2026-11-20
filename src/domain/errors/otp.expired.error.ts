import { DomainError } from "./base.error";
import { errorCodes } from "./error.codes";

export class OtpExpiredError extends DomainError {
	readonly code = errorCodes.OTP_EXPIRED;

	constructor() {
		super("OTP is invalid or has expired.");
	}
}
