
export interface ICustomerResetPasswordUseCase {
    execute(
        userId: string,
        password: string,
    ): Promise<void>;
}
