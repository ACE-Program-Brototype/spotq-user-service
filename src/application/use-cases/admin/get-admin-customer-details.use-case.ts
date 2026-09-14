import type { AdminCustomerDetailsResponseDto } from "@application/dtos/admin/admin-customer-details.dto.ts";
import type { IGetAdminCustomerDetailsUseCase } from "@application/ports/use-cases/admin/get-admin-customer-details.use-case.interface.ts";
import { TYPES } from "@config/di/types.ts";
import { CustomerNotFoundError } from "@domain/errors/index.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { inject, injectable } from "inversify";

@injectable()
export class GetAdminCustomerDetailsUseCase
	implements IGetAdminCustomerDetailsUseCase
{
	constructor(
		@inject(TYPES.UserRepository)
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(id: string): Promise<AdminCustomerDetailsResponseDto> {
		const user = await this.userRepository.findById(id);

		if (!user) {
			throw new CustomerNotFoundError();
		}

		// TODO: Customer order details will be integrated from Order Service in the future.
		return {
			id: user.id,
			fullname: user.fullName.getValue(),
			email: user.email.getValue(),
			status: user.status,
		};
	}
}
