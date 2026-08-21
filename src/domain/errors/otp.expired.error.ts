import { DomainError } from "./base.error";

export class OtpExpiredError extends DomainError {
	readonly code = "OTP_EXPIRED";

	constructor() {
		super("OTP is invalid or has expired.");
	}
}