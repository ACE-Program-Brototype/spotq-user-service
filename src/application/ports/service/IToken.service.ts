export interface ITokenService {
	generateAccessToken(payload: object): string;

	generateRefreshToken(payload: object): string;

	getTokenTTL(token: string): number;

	hashRefreshToken(token: string): string;
}
