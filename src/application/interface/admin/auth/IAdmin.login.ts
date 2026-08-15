import type { AdminLoginDTO } from "@application/dtos/admin/auth/admin.login.dto";

export interface IAdminLoginUseCase {
	execute(email: string, password: string): Promise<AdminLoginDTO | null>;
}
