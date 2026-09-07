import type { IPasswordHashService } from "@application/ports/services";
import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
import bcrypt from "bcrypt";

const zxcvbn = new ZxcvbnFactory({
	dictionary: {
		...zxcvbnCommonPackage.dictionary,
		...zxcvbnEnPackage.dictionary,
	},
	graphs: zxcvbnCommonPackage.adjacencyGraphs,
	translations: zxcvbnEnPackage.translations,
});

export class BcryptPasswordHasher implements IPasswordHashService {
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

	validateStrongPassword(password: string): boolean {
		const result = zxcvbn.check(password);

		if (result.score < 3) {
			return false;
		}
		return true;
	}
}
