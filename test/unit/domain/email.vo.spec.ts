import { InvalidEmailError } from "@domain/errors/domain.error.ts";
import { Email } from "@domain/value-objects/email.vo.ts";

describe("Email Value Object", () => {
	it("should create and normalize email to lowercase", () => {
		const email = Email.create("John.Doe@Example.COM");
		expect(email.getValue()).toBe("john.doe@example.com");
	});

	it("should trim surrounding whitespace", () => {
		const email = Email.create("  user@spotq.com  ");
		expect(email.getValue()).toBe("user@spotq.com");
	});

	it("should throw InvalidEmailError for invalid email formats", () => {
		expect(() => Email.create("plainaddress")).toThrow(InvalidEmailError);
		expect(() => Email.create("@missingusername.com")).toThrow(
			InvalidEmailError,
		);
		expect(() => Email.create("user@.com")).toThrow(InvalidEmailError);
		expect(() => Email.create("")).toThrow(InvalidEmailError);
		expect(() => Email.create("   ")).toThrow(InvalidEmailError);
	});

	it("should throw InvalidEmailError for non-string input", () => {
		expect(() => Email.create(null)).toThrow(InvalidEmailError);
		expect(() => Email.create(undefined)).toThrow(InvalidEmailError);
	});
});
