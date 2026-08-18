

export interface IAdminVerifyEmailForgotPasswordUseCase {
    execute(email: string, otp: string) : Promise<string>
}