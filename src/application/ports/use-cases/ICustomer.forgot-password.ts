export interface ICustomerForgotPasswordUseCase {
	execute(email: string): Promise<void>;
}
