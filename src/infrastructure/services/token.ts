import crypto from "node:crypto";
import { config } from "@config/env.ts";
import jwt from "jsonwebtoken";

export function generateAccessToken(payload: object): string {
	const token = jwt.sign(payload, config.jwt.access.secret, {
		expiresIn: config.jwt.access.expiresIn as jwt.SignOptions["expiresIn"],
	});
	console.log("Access Token Generated:", token);
	return token;
}

export function generateRefreshToken(payload: object): string {
	const token = jwt.sign(payload, config.jwt.refresh.secret, {
		expiresIn: config.jwt.refresh.expiresIn as jwt.SignOptions["expiresIn"],
	});
	return token;
}

export function getTokenTTL(token: string): number {
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

export function hashRefreshToken(token: string): string {
	return crypto.createHash("sha256").update(token).digest("hex");
}
