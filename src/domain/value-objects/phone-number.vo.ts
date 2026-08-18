import { InvalidPhoneNumberError } from "../errors/domain.error.ts";

export class PhoneNumber {
	private readonly _value: string;

	// Indian mobile number: +91 followed by 10 digits starting with 6, 7, 8, 9
	private static readonly INDIAN_PHONE_REGEX = /^\+91[6-9]\d{9}$/;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(rawPhone: unknown): PhoneNumber {
		if (typeof rawPhone !== "string") {
			throw new InvalidPhoneNumberError("Phone number must be a string.");
		}

		const trimmed = rawPhone.trim();

		if (!trimmed) {
			throw new InvalidPhoneNumberError("Phone number cannot be empty.");
		}

		if (!trimmed.startsWith("+91")) {
			throw new InvalidPhoneNumberError(
				"Phone number must start with +91 (Indian numbers only).",
			);
		}

		// Normalize by removing any spaces or dashes
		const normalized = `+91${trimmed.slice(3).replace(/[\s-]/g, "")}`;

		if (!PhoneNumber.INDIAN_PHONE_REGEX.test(normalized)) {
			throw new InvalidPhoneNumberError(
				"Invalid Indian mobile number format. Expected +91 followed by 10 digits.",
			);
		}

		return new PhoneNumber(normalized);
	}

	public getValue(): string {
		return this._value;
	}

	public toString(): string {
		return this._value;
	}

	public equals(other: PhoneNumber): boolean {
		return this._value === other._value;
	}
}
