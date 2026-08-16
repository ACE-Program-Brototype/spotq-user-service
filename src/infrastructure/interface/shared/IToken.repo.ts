

export interface IRefreshTokenRepository {
    revoke(token: string, ttlSeconds: number): Promise<void>;
    isRevoked(token: string): Promise<boolean>;
}