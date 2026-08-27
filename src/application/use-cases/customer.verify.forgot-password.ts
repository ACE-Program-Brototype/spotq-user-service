import { IOtpService, ITokenService } from "@application/ports/services";
import { ICustomerVerifyForgotPasswordUseCase } from "@application/ports/use-cases/ICustomer.verify.forgot-password";
import { TYPES } from "@config/di";
import { UserNotFoundError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories";
import { inject, injectable } from "inversify";


@injectable()
export class CustomerVerifyForgotPasswordUseCase implements ICustomerVerifyForgotPasswordUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.OtpServices)
        private readonly _otpService: IOtpService,
        @inject(TYPES.TokenServices)
        private readonly _tokenService: ITokenService,
    ) {}

    public async execute(email: string, otp: string): Promise<string> {
        const user = await this._userRepository.findByEmail(email);

        if (!user) {
            throw new UserNotFoundError();
        }

        await this._otpService.verifyOtp(email, otp);

        const tempToken = this._tokenService.generateTempToken({
            userId: user.id,
            role: "customer",
        });

        return tempToken;
    }
}
