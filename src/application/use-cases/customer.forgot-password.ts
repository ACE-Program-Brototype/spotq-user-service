import { IEmailQueueProducer, IOtpService } from "@application/ports/services";
import { ICustomerForgotPasswordUseCase } from "@application/ports/use-cases/ICustomer.forgot-password";
import { TYPES } from "@config/di";
import { InvalidCredentialsError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories";
import { inject, injectable } from "inversify";

@injectable()
export class CustomerForgotPasswordUseCase implements ICustomerForgotPasswordUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly _userAuthRepository: IUserRepository,
        @inject(TYPES.OtpServices)
        private readonly _otpService: IOtpService,
        @inject(TYPES.EmailQueueProducers)
        private readonly _emailQueueProducer: IEmailQueueProducer,
    ) {}

    async execute(email: string): Promise<void> {
        const user = await this._userAuthRepository.findByEmail(email);

        if (!user) {
            throw new InvalidCredentialsError();
        }

        const otp = await this._otpService.generateAndStoreOtp(user.email.getValue());

        await this._emailQueueProducer.queueVerificationEmail({
            email: email,
            otp,
        });
    }
}
