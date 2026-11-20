import { REGEX, VALUE_OBJECT_ERRORS } from "@shared/constants/index.ts";
import { InvalidPhoneNumberError } from "../errors/domain.error.ts";

export class PhoneNumber {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(rawPhone: unknown): PhoneNumber {
		if (typeof rawPhone !== "string") {
			throw new InvalidPhoneNumberError(VALUE_OBJECT_ERRORS.PHONE.TYPE);
		}

		const trimmed = rawPhone.trim();

		if (!trimmed) {
			throw new InvalidPhoneNumberError(VALUE_OBJECT_ERRORS.PHONE.EMPTY);
		}

		if (!trimmed.startsWith("+91")) {
			throw new InvalidPhoneNumberError(VALUE_OBJECT_ERRORS.PHONE.REGION);
		}

		// Normalize by removing any spaces or dashes
		const normalized = `+91${trimmed.slice(3).replace(/[\s-]/g, "")}`;

		if (!REGEX.INDIAN_PHONE.test(normalized)) {
			throw new InvalidPhoneNumberError(VALUE_OBJECT_ERRORS.PHONE.FORMAT);
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
