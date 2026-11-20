import { InvalidNameError } from "@domain/errors/domain.error.ts";
import { FullName } from "@domain/value-objects/full-name.vo.ts";

describe("FullName Value Object", () => {
	it("should create a valid FullName for standard names", () => {
		const name1 = FullName.create("John Doe");
		expect(name1.getValue()).toBe("John Doe");

		const name2 = FullName.create("Mary-Jane Watson");
		expect(name2.getValue()).toBe("Mary-Jane Watson");

		const name3 = FullName.create("O'Connor");
		expect(name3.getValue()).toBe("O'Connor");

		const name4 = FullName.create("José Silva");
		expect(name4.getValue()).toBe("José Silva");
	});

	it("should trim leading and trailing whitespace", () => {
		const name = FullName.create("   John Doe   ");
		expect(name.getValue()).toBe("John Doe");
	});

	it("should throw InvalidNameError for names shorter than 2 characters", () => {
		expect(() => FullName.create("A")).toThrow(InvalidNameError);
		expect(() => FullName.create("")).toThrow(InvalidNameError);
		expect(() => FullName.create("   ")).toThrow(InvalidNameError);
	});

	it("should throw InvalidNameError for names longer than 100 characters", () => {
		const longName = "A".repeat(101);
		expect(() => FullName.create(longName)).toThrow(InvalidNameError);
	});

	it("should throw InvalidNameError for numbers or special symbols only", () => {
		expect(() => FullName.create("123456")).toThrow(InvalidNameError);
		expect(() => FullName.create("@@@###")).toThrow(InvalidNameError);
		expect(() => FullName.create("John123")).toThrow(InvalidNameError);
	});

	it("should throw InvalidNameError for non-string input", () => {
		expect(() => FullName.create(null)).toThrow(InvalidNameError);
		expect(() => FullName.create(undefined)).toThrow(InvalidNameError);
		expect(() => FullName.create(123)).toThrow(InvalidNameError);
	});
});
