import {
	REGEX,
	VALIDATION_LIMITS,
	VALUE_OBJECT_ERRORS,
} from "@shared/constants/index.ts";
import { InvalidNameError } from "../errors/domain.error.ts";

export class FullName {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	private static hasControlChars(str: string): boolean {
		for (let i = 0; i < str.length; i++) {
			const code = str.charCodeAt(i);
			if ((code >= 0 && code <= 31) || (code >= 127 && code <= 159)) {
				return true;
			}
		}
		return false;
	}

	public static create(rawName: unknown): FullName {
		if (typeof rawName !== "string") {
			throw new InvalidNameError(VALUE_OBJECT_ERRORS.FULL_NAME.TYPE);
		}

		const trimmed = rawName.trim();

		if (
			!trimmed ||
			trimmed.length < VALIDATION_LIMITS.FULL_NAME.MIN_LENGTH ||
			trimmed.length > VALIDATION_LIMITS.FULL_NAME.MAX_LENGTH
		) {
			throw new InvalidNameError(VALUE_OBJECT_ERRORS.FULL_NAME.LENGTH);
		}

		if (FullName.hasControlChars(trimmed)) {
			throw new InvalidNameError(VALUE_OBJECT_ERRORS.FULL_NAME.CONTROL_CHARS);
		}

		if (!REGEX.NAME.test(trimmed)) {
			throw new InvalidNameError(VALUE_OBJECT_ERRORS.FULL_NAME.FORMAT);
		}

		return new FullName(trimmed);
	}

	public getValue(): string {
		return this._value;
	}

	public toString(): string {
		return this._value;
	}
}
