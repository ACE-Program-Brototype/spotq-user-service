import type { IAdminPasswordHasher } from "@application/ports/services/IPassword.service";
import bcrypt from "bcrypt";

export class BcryptPasswordHasher implements IAdminPasswordHasher {
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
