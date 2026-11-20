import type { AdminResetPasswordDto } from "@application/dtos/admin/auth/admin.forgot-password";

export interface IAdminResetPasswordUseCase {
	execute(
		userId: string,
		password: string,
	): Promise<AdminResetPasswordDto | null>;
}
