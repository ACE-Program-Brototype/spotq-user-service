import crypto from "node:crypto";
import { config } from "@config/env.ts";

export interface JsonWebKey {
	kty: string;
	use: string;
	alg: string;
	kid: string;
	n: string;
	e: string;
}

export interface JsonWebKeySet {
	keys: JsonWebKey[];
}

let cachedJwks: JsonWebKeySet | null = null;

export function getJwks(): JsonWebKeySet {
	if (cachedJwks) {
		return cachedJwks;
	}

	const publicKey = config.jwt.access.publicKey;
	const keyObj = crypto.createPublicKey(publicKey);
	const jwk = keyObj.export({ format: "jwk" });

	cachedJwks = {
		keys: [
			{
				kty: jwk.kty ?? "RSA",
				use: "sig",
				alg: config.jwt.access.algorithm,
				kid: config.jwt.access.keyId,
				n: jwk.n ?? "",
				e: jwk.e ?? "",
			},
		],
	};

	return cachedJwks;
}
