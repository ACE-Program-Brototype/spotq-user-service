import crypto from "node:crypto";

import type { ITokenService } from "@application/ports/service/IToken.service";
import { config } from "@config/env.ts";
import jwt from "jsonwebtoken";

export class JwtTokenService implements ITokenService {
	private readonly accessSecret: string;
	private readonly accessExpiresIn: jwt.SignOptions["expiresIn"];

	private readonly refreshSecret: string;
	private readonly refreshExpiresIn: jwt.SignOptions["expiresIn"];

	private readonly tempSecret: string;
	private readonly tempExpiresIn: jwt.SignOptions["expiresIn"];

	constructor() {
		this.accessSecret = config.jwt.access.secret;
		this.accessExpiresIn = config.jwt.access
			.expiresIn as jwt.SignOptions["expiresIn"];

		this.refreshSecret = config.jwt.refresh.secret;
		this.refreshExpiresIn = config.jwt.refresh
			.expiresIn as jwt.SignOptions["expiresIn"];

		this.tempSecret = config.jwt.temp.secret;
		this.tempExpiresIn = config.jwt.temp
			.expiresIn as jwt.SignOptions["expiresIn"];
	}

	generateAccessToken(payload: object): string {
		return jwt.sign(payload, this.accessSecret, {
			expiresIn: this.accessExpiresIn,
		});
	}

	generateRefreshToken(payload: object): string {
		return jwt.sign(payload, this.refreshSecret, {
			expiresIn: this.refreshExpiresIn,
		});
	}

	generateTempToken(payload: object): string {
		return jwt.sign(payload, this.tempSecret, {
			expiresIn: this.tempExpiresIn,
		});
	}

	verifyAccessToken<T extends object>(token: string): T {
		return jwt.verify(token, this.accessSecret) as T;
	}

	verifyRefreshToken<T extends object>(token: string): T {
		return jwt.verify(token, this.refreshSecret) as T;
	}

	verifyTempToken<T extends object>(token: string): T {
		return jwt.verify(token, this.tempSecret) as T;
	}

	getTokenTTL(token: string): number {
		const decoded = jwt.decode(token);

		if (
			!decoded ||
			typeof decoded === "string" ||
			typeof decoded.exp !== "number"
		) {
			return 0;
		}

		const currentTime = Math.floor(Date.now() / 1000);

		return Math.max(decoded.exp - currentTime, 0);
	}

	hashToken(token: string): string {
		return crypto.createHash("sha256").update(token).digest("hex");
	}
}
