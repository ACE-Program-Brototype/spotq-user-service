import { DomainError } from "./base.error";

export class InvalidOtpError extends DomainError {
	readonly code = "INVALID_OTP";

	constructor() {
		super("OTP is invalid.");
	}
}
