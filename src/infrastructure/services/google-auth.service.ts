import type {
	GoogleUserPayload,
	IGoogleAuthService,
} from "@application/ports/services/google-auth-service.interface.ts";
import type { ILogger } from "@application/ports/services/logger.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { config } from "@config/env.ts";
import { InvalidGoogleTokenError } from "@domain/errors/domain.error.ts";
import { OAuth2Client } from "google-auth-library";
import { inject, injectable } from "inversify";

@injectable()
export class GoogleAuthService implements IGoogleAuthService {
	private readonly client: OAuth2Client;

	constructor(
		@inject(TYPES.Logger)
		private readonly logger: ILogger,
	) {
		this.client = new OAuth2Client(config.google.clientId);
	}

	public async verifyIdToken(idToken: string): Promise<GoogleUserPayload> {
		try {
			const ticket = await this.client.verifyIdToken({
				idToken,
				audience: config.google.clientId,
			});

			const payload = ticket.getPayload();
			if (!payload) {
				throw new InvalidGoogleTokenError();
			}

			// Validate issuer
			const issuer = payload.iss;
			if (
				issuer !== "accounts.google.com" &&
				issuer !== "https://accounts.google.com"
			) {
				throw new InvalidGoogleTokenError("Invalid token issuer.");
			}

			// Validate sub (subject ID) is present
			const sub = payload.sub;
			if (!sub) {
				throw new InvalidGoogleTokenError(
					"Token missing user identifier (sub).",
				);
			}

			// Validate email is present
			const email = payload.email;
			if (!email) {
				throw new InvalidGoogleTokenError("Token missing email address.");
			}

			// Validate email_verified is true
			if (payload.email_verified !== true) {
				throw new InvalidGoogleTokenError(
					"Google email address is not verified.",
				);
			}

			return {
				sub,
				email,
				emailVerified: payload.email_verified,
				name: payload.name || "Google User",
				picture: payload.picture ?? null,
			};
		} catch (error) {
			this.logger.warn({ err: error }, "Google ID Token verification failed");
			throw new InvalidGoogleTokenError(
				error instanceof InvalidGoogleTokenError
					? error.message
					: "Google authentication is invalid. Please try again.",
			);
		}
	}
}
