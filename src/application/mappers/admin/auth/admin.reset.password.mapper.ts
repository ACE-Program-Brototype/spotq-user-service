
import { AdminResetPasswordDto } from "@application/dtos/admin/auth/admin.forgot-password";
import type { Admin } from "@domain/entities/admin";

export function toAdminResetPasswordResponse(
    admin: Admin
): AdminResetPasswordDto {
    return {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        created_at: admin.createdAt
    };
}
