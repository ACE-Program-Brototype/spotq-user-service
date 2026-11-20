export interface ICustomerVerifyForgotPasswordUseCase {
	execute(email: string, otp: string): Promise<string>;
}
