import { GetAdminCustomerDetailsUseCase } from "@application/use-cases/admin/get-admin-customer-details.use-case.ts";
import { CustomerNotFoundError } from "@domain/errors/index.ts";
import { prisma } from "@infrastructure/database/prisma/prisma.ts";

jest.mock("@infrastructure/database/prisma/prisma.ts", () => ({
	prisma: {
		user: {
			findUnique: jest.fn(),
		},
	},
}));

describe("GetAdminCustomerDetailsUseCase", () => {
	let useCase: GetAdminCustomerDetailsUseCase;

	beforeEach(() => {
		jest.clearAllMocks();
		useCase = new GetAdminCustomerDetailsUseCase();
	});

	it("should return customer details when customer exists", async () => {
		const mockCustomer = {
			id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullname: "Jane Doe",
			email: "jane.doe@example.com",
			status: "ACTIVE",
		};

		(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockCustomer);

		const result = await useCase.execute(
			"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		);

		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" },
			select: {
				id: true,
				fullname: true,
				email: true,
				status: true,
			},
		});

		expect(result).toEqual({
			id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullname: "Jane Doe",
			email: "jane.doe@example.com",
			status: "ACTIVE",
		});
	});

	it("should throw CustomerNotFoundError when customer does not exist", async () => {
		(prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

		await expect(useCase.execute("non-existent-customer-id")).rejects.toThrow(
			CustomerNotFoundError,
		);

		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: "non-existent-customer-id" },
			select: {
				id: true,
				fullname: true,
				email: true,
				status: true,
			},
		});
	});
});
