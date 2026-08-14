import { InvalidPasswordError } from "../errors/domain.error.ts";

export class PlainPassword {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	public static create(rawPassword: unknown): PlainPassword {
		if (typeof rawPassword !== "string") {
			throw new InvalidPasswordError("Password must be a string.");
		}

		if (rawPassword !== rawPassword.trim()) {
			throw new InvalidPasswordError(
				"Password must not contain leading or trailing whitespace.",
			);
		}

		if (rawPassword.length < 8 || rawPassword.length > 128) {
			throw new InvalidPasswordError(
				"Password must be between 8 and 128 characters long.",
			);
		}

		const hasUppercase = /[A-Z]/.test(rawPassword);
		const hasLowercase = /[a-z]/.test(rawPassword);
		const hasNumber = /[0-9]/.test(rawPassword);
		const hasSpecial = /[^A-Za-z0-9]/.test(rawPassword);

		if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
			throw new InvalidPasswordError(
				"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
			);
		}

		return new PlainPassword(rawPassword);
	}

	public getValue(): string {
		return this.value;
	}
}
