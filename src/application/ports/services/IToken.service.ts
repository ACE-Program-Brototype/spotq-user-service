export interface IAdminTokenService {
	generateAccessToken(payload: object): string;

	generateRefreshToken(payload: object): string;

	generateTempToken(payload: object): string;

	verifyAccessToken<T extends object>(token: string): T;

	verifyRefreshToken<T extends object>(token: string): T;

	verifyTempToken<T extends object>(token: string): T;

	getTokenTTL(token: string): number;

	hashToken(token: string): string;
}
