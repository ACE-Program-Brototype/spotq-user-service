import { InvalidPhoneNumberError } from "@domain/errors/domain.error.ts";
import { PhoneNumber } from "@domain/value-objects/phone-number.vo.ts";

describe("PhoneNumber Value Object", () => {
	it("should create valid Indian mobile phone numbers", () => {
		const phone = PhoneNumber.create("+919876543210");
		expect(phone.getValue()).toBe("+919876543210");
	});

	it("should normalize phone number with spaces or hyphens", () => {
		const phone = PhoneNumber.create("+91 98765-43210");
		expect(phone.getValue()).toBe("+919876543210");
	});

	it("should reject non-+91 numbers", () => {
		expect(() => PhoneNumber.create("9876543210")).toThrow(
			InvalidPhoneNumberError,
		);
		expect(() => PhoneNumber.create("+449876543210")).toThrow(
			InvalidPhoneNumberError,
		);
		expect(() => PhoneNumber.create("+12025550143")).toThrow(
			InvalidPhoneNumberError,
		);
	});

	it("should reject invalid mobile digit patterns", () => {
		// Starting with 1, 2, 3, 4, 5 after +91 is not a valid Indian mobile number
		expect(() => PhoneNumber.create("+911234567890")).toThrow(
			InvalidPhoneNumberError,
		);
		// Too short or too long
		expect(() => PhoneNumber.create("+91987654321")).toThrow(
			InvalidPhoneNumberError,
		);
		expect(() => PhoneNumber.create("+9198765432100")).toThrow(
			InvalidPhoneNumberError,
		);
	});
});
