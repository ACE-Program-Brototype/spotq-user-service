import type { ILogger } from "@application/ports/services/logger.interface.ts";
import { InvalidGoogleTokenError } from "@domain/errors/domain.error.ts";
import { GoogleAuthService } from "@infrastructure/services/google-auth.service.ts";
import { OAuth2Client } from "google-auth-library";

jest.mock("google-auth-library", () => {
	return {
		OAuth2Client: jest.fn().mockImplementation(() => {
			return {
				verifyIdToken: jest.fn(),
			};
		}),
	};
});

describe("GoogleAuthService", () => {
	let service: GoogleAuthService;
	let mockOAuthClientInstance: { verifyIdToken: jest.Mock };
	let mockLogger: jest.Mocked<ILogger>;

	beforeEach(() => {
		jest.clearAllMocks();
		mockLogger = {
			info: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
		};
		service = new GoogleAuthService(mockLogger);
		mockOAuthClientInstance = (OAuth2Client as unknown as jest.Mock).mock
			.results[0]?.value;
	});

	it("should successfully verify a valid ID token", async () => {
		const payload = {
			iss: "https://accounts.google.com",
			sub: "google-sub-123",
			email: "test@gmail.com",
			email_verified: true,
			name: "John Doe",
			picture: "https://example.com/avatar.jpg",
		};

		mockOAuthClientInstance.verifyIdToken.mockResolvedValue({
			getPayload: () => payload,
		});

		const result = await service.verifyIdToken("valid-token");

		expect(result).toEqual({
			sub: "google-sub-123",
			email: "test@gmail.com",
			emailVerified: true,
			name: "John Doe",
			picture: "https://example.com/avatar.jpg",
		});
	});

	it("should throw InvalidGoogleTokenError if payload is empty", async () => {
		mockOAuthClientInstance.verifyIdToken.mockResolvedValue({
			getPayload: () => null,
		});

		await expect(service.verifyIdToken("invalid-token")).rejects.toThrow(
			InvalidGoogleTokenError,
		);
	});

	it("should throw InvalidGoogleTokenError if issuer is invalid", async () => {
		const payload = {
			iss: "malicious-issuer.com",
			sub: "google-sub-123",
			email: "test@gmail.com",
			email_verified: true,
		};

		mockOAuthClientInstance.verifyIdToken.mockResolvedValue({
			getPayload: () => payload,
		});

		await expect(service.verifyIdToken("invalid-token")).rejects.toThrow(
			"Invalid token issuer.",
		);
	});

	it("should throw InvalidGoogleTokenError if email is not verified", async () => {
		const payload = {
			iss: "https://accounts.google.com",
			sub: "google-sub-123",
			email: "test@gmail.com",
			email_verified: false,
		};

		mockOAuthClientInstance.verifyIdToken.mockResolvedValue({
			getPayload: () => payload,
		});

		await expect(service.verifyIdToken("invalid-token")).rejects.toThrow(
			"Google email address is not verified.",
		);
	});

	it("should throw InvalidGoogleTokenError if sub is missing", async () => {
		const payload = {
			iss: "https://accounts.google.com",
			email: "test@gmail.com",
			email_verified: true,
		};

		mockOAuthClientInstance.verifyIdToken.mockResolvedValue({
			getPayload: () => payload,
		});

		await expect(service.verifyIdToken("invalid-token")).rejects.toThrow(
			"Token missing user identifier (sub).",
		);
	});
});
