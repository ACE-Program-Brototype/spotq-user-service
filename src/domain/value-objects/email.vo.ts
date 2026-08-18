import { InvalidEmailError } from "../errors/domain.error.ts";

export class Email {
	private readonly _value: string;

	// Standard industry email regex complying with practical RFC-5322
	private static readonly EMAIL_REGEX =
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(rawEmail: unknown): Email {
		if (typeof rawEmail !== "string") {
			throw new InvalidEmailError("Email must be a string.");
		}

		const trimmed = rawEmail.trim();

		if (!trimmed || trimmed.length > 254) {
			throw new InvalidEmailError("Invalid email length.");
		}

		const normalized = trimmed.toLowerCase();

		if (!Email.EMAIL_REGEX.test(normalized)) {
			throw new InvalidEmailError("Invalid email format.");
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
