import type { AdminCustomerDetailsResponseDto } from "@application/dtos/admin/admin-customer-details.dto.ts";
import type { IGetAdminCustomerDetailsUseCase } from "@application/ports/use-cases/admin/get-admin-customer-details.use-case.interface.ts";
import { CustomerNotFoundError } from "@domain/errors/index.ts";
import { prisma } from "@infrastructure/database/prisma/prisma.ts";
import { injectable } from "inversify";

@injectable()
export class GetAdminCustomerDetailsUseCase
	implements IGetAdminCustomerDetailsUseCase
{
	public async execute(id: string): Promise<AdminCustomerDetailsResponseDto> {
		// Query database directly for customer user with explicit DB field selection
		const customer = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				fullname: true,
				email: true,
				status: true,
			},
		});

		if (!customer) {
			throw new CustomerNotFoundError();
		}

		// TODO: Customer order details will be integrated from Order Service in the future.
		return {
			id: customer.id,
			fullname: customer.fullname,
			email: customer.email,
			status: customer.status,
		};
	}
}
