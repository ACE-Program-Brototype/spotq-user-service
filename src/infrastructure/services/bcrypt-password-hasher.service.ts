import type { IPasswordHasher } from "@application/ports/services/password-hasher.interface.ts";
import { config } from "@config/env.ts";
import type { PlainPassword } from "@domain/value-objects/password.vo.ts";
import bcrypt from "bcrypt";
import { injectable } from "inversify";

@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
	async hash(password: PlainPassword): Promise<string> {
		const salt = await bcrypt.genSalt(config.auth.bcryptSaltRounds);
		return bcrypt.hash(password.getValue(), salt);
	}

	async compare(plain: string, hash: string): Promise<boolean> {
		return bcrypt.compare(plain, hash);
	}
}
