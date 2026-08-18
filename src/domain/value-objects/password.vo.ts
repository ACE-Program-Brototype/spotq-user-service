import { REGEX, VALIDATION_LIMITS, VALUE_OBJECT_ERRORS } from "@shared/constants/index.ts";
import { InvalidPasswordError } from "../errors/domain.error.ts";

export class PlainPassword {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(rawPassword: unknown): PlainPassword {
		if (typeof rawPassword !== "string") {
			throw new InvalidPasswordError(VALUE_OBJECT_ERRORS.PASSWORD.TYPE);
		}

		if (rawPassword !== rawPassword.trim()) {
			throw new InvalidPasswordError(VALUE_OBJECT_ERRORS.PASSWORD.WHITESPACE);
		}

		if (
			rawPassword.length < VALIDATION_LIMITS.PASSWORD.MIN_LENGTH ||
			rawPassword.length > VALIDATION_LIMITS.PASSWORD.MAX_LENGTH
		) {
			throw new InvalidPasswordError(VALUE_OBJECT_ERRORS.PASSWORD.LENGTH);
		}

		const hasUppercase = REGEX.PASSWORD.UPPERCASE.test(rawPassword);
		const hasLowercase = REGEX.PASSWORD.LOWERCASE.test(rawPassword);
		const hasNumber = REGEX.PASSWORD.NUMBER.test(rawPassword);
		const hasSpecial = REGEX.PASSWORD.SPECIAL.test(rawPassword);

		if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
			throw new InvalidPasswordError(VALUE_OBJECT_ERRORS.PASSWORD.STRENGTH);
		}

		return new PlainPassword(rawPassword);
	}

	public getValue(): string {
		return this._value;
	}
}
