import { AdminFotgotPasswordDTO } from "@application/dtos/admin/auth/admin.forgot-password";


export interface IAdminForgotPasswordUseCase {
    execute(email : string) : Promise<AdminFotgotPasswordDTO | null>
}