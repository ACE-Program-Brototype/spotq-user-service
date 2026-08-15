import type { AdminLoginDTO } from "@application/dtos/admin/auth/admin.login.dto";
import type { Admin } from "@domain/entities/admin";

export class AdminLoginMapper {
	static toResponse(
		admin: Admin,
		accessToken: string,
		refreshToken: string,
	): AdminLoginDTO {
		return {
			user: {
				_id: admin.id,
				name: admin.name,
				email: admin.email,
				created_at: admin.createdAt,
			},
			access_token: accessToken,
			refresh_token: refreshToken,
		};
	}
}
