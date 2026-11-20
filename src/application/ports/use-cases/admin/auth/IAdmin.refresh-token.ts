import type { AdminLoginDTO } from "@application/dtos/admin/auth/admin.login.dto";

export interface IAdminRefreshTokenUseCase {
	execute(refreshToken: string): Promise<AdminLoginDTO>;
}
