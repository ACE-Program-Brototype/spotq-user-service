import type { IPasswordHasher } from "@application/ports/service/IPassword.service";
import bcrypt from "bcrypt";

export class BcryptPasswordHasher implements IPasswordHasher {
	private readonly saltRounds: number;

	constructor() {
		this.saltRounds = 10;
	}

	async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, this.saltRounds);
	}

	async verifyPassword(
		password: string,
		passwordHash: string,
	): Promise<boolean> {
		return bcrypt.compare(password, passwordHash);
	}
}
