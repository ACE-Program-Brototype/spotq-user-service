import { PlainPassword } from "@domain/value-objects/password.vo.ts";
import { BcryptPasswordHasher } from "@infrastructure/services/bcrypt-password-hasher.service.ts";

describe("BcryptPasswordHasher", () => {
	let hasher: BcryptPasswordHasher;

	beforeEach(() => {
		hasher = new BcryptPasswordHasher();
	});

	it("should hash a plain password correctly", async () => {
		const plainPassword = PlainPassword.create("Password@123");
		const hash = await hasher.hash(plainPassword);

		expect(hash).toBeDefined();
		expect(hash.startsWith("$2")).toBe(true);
	});

	it("should return true when comparing correct password", async () => {
		const plainPassword = PlainPassword.create("Password@123");
		const hash = await hasher.hash(plainPassword);

		const isMatch = await hasher.compare("Password@123", hash);
		expect(isMatch).toBe(true);
	});

	it("should return false when comparing wrong password", async () => {
		const plainPassword = PlainPassword.create("Password@123");
		const hash = await hasher.hash(plainPassword);

		const isMatch = await hasher.compare("WrongPassword@123", hash);
		expect(isMatch).toBe(false);
	});
});
