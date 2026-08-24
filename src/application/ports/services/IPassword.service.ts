export interface IAdminPasswordHasher {
	hashPassword(password: string): Promise<string>;
	verifyPassword(password: string, passwordHash: string): Promise<boolean>;
}
