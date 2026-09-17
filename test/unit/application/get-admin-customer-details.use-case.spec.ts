import { GetAdminCustomerDetailsUseCase } from "@application/use-cases/admin/get-admin-customer-details.use-case.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import { CustomerNotFoundError } from "@domain/errors/index.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { Email } from "@domain/value-objects/email.vo.ts";
import { FullName } from "@domain/value-objects/full-name.vo.ts";

describe("GetAdminCustomerDetailsUseCase", () => {
	let useCase: GetAdminCustomerDetailsUseCase;
	let mockUserRepository: jest.Mocked<IUserRepository>;

	beforeEach(() => {
		jest.clearAllMocks();
		mockUserRepository = {
			find: jest.fn(),
			findById: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			findByEmail: jest.fn(),
			findByPhone: jest.fn(),
			findByGoogleId: jest.fn(),
			createWithSession: jest.fn(),
			updateProfile: jest.fn(),
		};
		useCase = new GetAdminCustomerDetailsUseCase(mockUserRepository);
	});

	it("should return customer details when customer exists", async () => {
		const createdAt = new Date("2026-01-15T10:00:00Z");
		const updatedAt = new Date("2026-01-15T10:00:00Z");

		const mockUserEntity = UserEntity.reconstitute({
			id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullName: FullName.create("Jane Doe"),
			email: Email.create("jane.doe@example.com"),
			phone: null,
			passwordHash: "hashed_password",
			status: UserStatus.ACTIVE,
			isEmailVerified: true,
			createdAt,
			updatedAt,
		});

		mockUserRepository.findById.mockResolvedValue(mockUserEntity);

		const result = await useCase.execute(
			"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		);

		expect(mockUserRepository.findById).toHaveBeenCalledWith(
			"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		);

		expect(result).toEqual({
			id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			fullName: "Jane Doe",
			email: "jane.doe@example.com",
			phone: null,
			status: "ACTIVE",
			isEmailVerified: true,
			location: null,
			avatarUrl: null,
			createdAt: createdAt.toISOString(),
			updatedAt: updatedAt.toISOString(),
		});
	});

	it("should throw CustomerNotFoundError when customer does not exist", async () => {
		mockUserRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute("non-existent-customer-id")).rejects.toThrow(
			CustomerNotFoundError,
		);

		expect(mockUserRepository.findById).toHaveBeenCalledWith(
			"non-existent-customer-id",
		);
	});
});
