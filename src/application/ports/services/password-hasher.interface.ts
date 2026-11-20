import type { PlainPassword } from "@domain/value-objects/index.ts";

export interface IPasswordHasher {
	hash(password: PlainPassword): Promise<string>;
	compare(plain: string, hash: string): Promise<boolean>;
}
