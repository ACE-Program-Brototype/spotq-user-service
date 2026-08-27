export interface IPasswordHashService {
	hashPassword(password: string): Promise<string>;
	verifyPassword(password: string, passwordHash: string): Promise<boolean>;
}
