import crypto from "node:crypto";
import type { IIdGenerator } from "@application/ports/services/id-generator.interface.ts";
import { injectable } from "inversify";

@injectable()
export class CryptoIdGenerator implements IIdGenerator {
	public generateUuid(): string {
		return crypto.randomUUID();
	}
}
