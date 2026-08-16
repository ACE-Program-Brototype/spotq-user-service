

export interface IAdminLogoutUseCase {
    execute(refreshToken: string): Promise<void>;
}