import {
	REGEX,
	VALIDATION_LIMITS,
	VALUE_OBJECT_ERRORS,
} from "@shared/constants/index.ts";
import { InvalidEmailError } from "../errors/domain.error.ts";

export class Email {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(rawEmail: unknown): Email {
		if (typeof rawEmail !== "string") {
			throw new InvalidEmailError(VALUE_OBJECT_ERRORS.EMAIL.TYPE);
		}

		const trimmed = rawEmail.trim();

		if (!trimmed || trimmed.length > VALIDATION_LIMITS.EMAIL.MAX_LENGTH) {
			throw new InvalidEmailError(VALUE_OBJECT_ERRORS.EMAIL.LENGTH);
		}

		const normalized = trimmed.toLowerCase();

		if (!REGEX.EMAIL.test(normalized)) {
			throw new InvalidEmailError(VALUE_OBJECT_ERRORS.EMAIL.FORMAT);
		}

		return new Email(normalized);
	}

	public getValue(): string {
		return this._value;
	}

	public toString(): string {
		return this._value;
	}

	public equals(other: Email): boolean {
		return this._value === other._value;
	}
}
