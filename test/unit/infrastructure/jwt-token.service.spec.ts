import { JwtTokenService } from "@infrastructure/services/jwt-token.service.ts";
import jwt from "jsonwebtoken";

describe("JwtTokenService", () => {
	let service: JwtTokenService;

	beforeEach(() => {
		service = new JwtTokenService();
	});

	it("should generate and verify RS256 JWT access token with kid and role claims", () => {
		const token = service.generateAccessToken({
			userId: "usr-uuid-1234",
			email: "john.doe@example.com",
			role: "customer",
		});

		expect(token).toBeDefined();
		expect(typeof token).toBe("string");

		const decodedComplete = jwt.decode(token, { complete: true });
		expect(decodedComplete?.header.alg).toBe("RS256");
		expect(decodedComplete?.header.kid).toBe("spotq-main-key");

		const payload = service.verifyAccessToken(token);
		expect(payload.sub).toBe("usr-uuid-1234");
		expect(payload.email).toBe("john.doe@example.com");
		expect(payload.role).toBe("customer");
	});

	it("should generate cryptographically secure opaque refresh token and its hash", () => {
		const data = service.generateRefreshToken();

		expect(data.token).toBeDefined();
		expect(data.token.length).toBe(64); // 32 bytes hex = 64 characters
		expect(data.tokenHash).toBeDefined();
		expect(data.expiresAt.getTime()).toBeGreaterThan(Date.now());

		const calculatedHash = service.hashToken(data.token);
		expect(calculatedHash).toBe(data.tokenHash);
	});
});
