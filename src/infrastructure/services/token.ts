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
