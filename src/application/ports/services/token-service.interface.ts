export interface AccessTokenPayload {
	sub: string;
	email: string;
	iat?: number;
	exp?: number;
}

export interface GeneratedRefreshToken {
	token: string;
	tokenHash: string;
	expiresAt: Date;
}

export interface ITokenService {
	generateAccessToken(payload: { userId: string; email: string }): string;
	generateRefreshToken(): GeneratedRefreshToken;
	hashToken(token: string): string;
	verifyAccessToken(token: string): AccessTokenPayload;
}
