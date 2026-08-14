import crypto from "node:crypto";
import type {
	AccessTokenPayload,
	GeneratedRefreshToken,
	ITokenService,
} from "@application/ports/services/token-service.interface.ts";
import { config } from "@config/env.ts";
import { InvalidTokenError } from "@domain/errors/domain.error.ts";
import { injectable } from "inversify";
import jwt, { type SignOptions } from "jsonwebtoken";

@injectable()
export class JwtTokenService implements ITokenService {
	public generateAccessToken(payload: {
		userId: string;
		email: string;
	}): string {
		const claims = {
			sub: payload.userId,
			email: payload.email,
		};

		const signOptions: SignOptions = {
			expiresIn: config.jwt.accessExpiresIn as unknown as number,
		};

		return jwt.sign(claims, config.jwt.accessSecret, signOptions);
	}

	public generateRefreshToken(): GeneratedRefreshToken {
		// Generate 256-bit cryptographically secure random opaque token
		const token = crypto.randomBytes(32).toString("hex");
		const tokenHash = this.hashToken(token);
		const expiresAt = this.calculateExpiry(config.jwt.refreshExpiresIn);

		return {
			token,
			tokenHash,
			expiresAt,
		};
	}

	public hashToken(token: string): string {
		return crypto.createHash("sha256").update(token).digest("hex");
	}

	public verifyAccessToken(token: string): AccessTokenPayload {
		try {
			const decoded = jwt.verify(token, config.jwt.accessSecret);
			if (typeof decoded === "string" || !decoded.sub) {
				throw new InvalidTokenError("Invalid token payload.");
			}

			return {
				sub: decoded.sub as string,
				email: (decoded as { email?: string }).email ?? "",
				iat: decoded.iat,
				exp: decoded.exp,
			};
		} catch (_err) {
			throw new InvalidTokenError("Invalid or expired access token.");
		}
	}

	private calculateExpiry(durationStr: string): Date {
		const match = /^(\d+)([smhd])$/.exec(durationStr);
		let ms = 7 * 24 * 60 * 60 * 1000; // default 7 days

		if (match) {
			const value = Number.parseInt(match[1], 10);
			const unit = match[2];
			switch (unit) {
				case "s":
					ms = value * 1000;
					break;
				case "m":
					ms = value * 60 * 1000;
					break;
				case "h":
					ms = value * 60 * 60 * 1000;
					break;
				case "d":
					ms = value * 24 * 60 * 60 * 1000;
					break;
			}
		}

		return new Date(Date.now() + ms);
	}
}
