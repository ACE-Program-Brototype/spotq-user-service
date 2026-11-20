import { InvalidPasswordError } from "@domain/errors/domain.error.ts";
import { PlainPassword } from "@domain/value-objects/password.vo.ts";

describe("PlainPassword Value Object", () => {
	it("should accept strong passwords meeting all requirements", () => {
		const pwd = PlainPassword.create("Password@123");
		expect(pwd.getValue()).toBe("Password@123");
	});

	it("should reject passwords with leading or trailing whitespace", () => {
		expect(() => PlainPassword.create(" Password@123")).toThrow(
			InvalidPasswordError,
		);
		expect(() => PlainPassword.create("Password@123 ")).toThrow(
			InvalidPasswordError,
		);
	});

	it("should reject passwords shorter than 8 characters", () => {
		expect(() => PlainPassword.create("Pass@1")).toThrow(InvalidPasswordError);
	});

	it("should reject passwords longer than 128 characters", () => {
		const longPwd = `P@1${"a".repeat(126)}`;
		expect(() => PlainPassword.create(longPwd)).toThrow(InvalidPasswordError);
	});

	it("should reject passwords missing uppercase letters", () => {
		expect(() => PlainPassword.create("password@123")).toThrow(
			InvalidPasswordError,
		);
	});

	it("should reject passwords missing lowercase letters", () => {
		expect(() => PlainPassword.create("PASSWORD@123")).toThrow(
			InvalidPasswordError,
		);
	});

	it("should reject passwords missing numbers", () => {
		expect(() => PlainPassword.create("Password@XYZ")).toThrow(
			InvalidPasswordError,
		);
	});

	it("should reject passwords missing special characters", () => {
		expect(() => PlainPassword.create("Password1234")).toThrow(
			InvalidPasswordError,
		);
	});
});
