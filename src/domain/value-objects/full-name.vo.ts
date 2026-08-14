import { InvalidNameError } from "../errors/domain.error.ts";

export class FullName {
	private readonly value: string;

	// Regex allowing unicode letters (marks/alphabets), spaces, hyphens, and apostrophes
	private static readonly NAME_REGEX =
		/^[\p{L}\p{M}]+(?:[' -][\p{L}\p{M}]+)*$/u;

	private constructor(value: string) {
		this.value = value;
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
			throw new InvalidNameError("Full name must be a string.");
		}

		const trimmed = rawName.trim();

		if (!trimmed || trimmed.length < 2 || trimmed.length > 100) {
			throw new InvalidNameError(
				"Full name must be between 2 and 100 characters.",
			);
		}

		if (FullName.hasControlChars(trimmed)) {
			throw new InvalidNameError(
				"Full name must not contain control characters.",
			);
		}

		if (!FullName.NAME_REGEX.test(trimmed)) {
			throw new InvalidNameError(
				"Full name can only contain letters, spaces, hyphens, and apostrophes.",
			);
		}

		return new FullName(trimmed);
	}

	public getValue(): string {
		return this.value;
	}

	public toString(): string {
		return this.value;
	}
}
