import { ListCustomersUseCase } from "@application/use-cases/admin/list-customers.use-case.ts";
import { UserEntity, UserStatus } from "@domain/entities/user.entity.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";
import { Email, FullName, PhoneNumber } from "@domain/value-objects/index.ts";

describe("ListCustomersUseCase", () => {
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let useCase: ListCustomersUseCase;

	const fixedDate = new Date("2026-03-01T10:00:00.000Z");

	const sampleUser1 = UserEntity.reconstitute({
		id: "user-1",
		fullName: FullName.create("Alice Walker"),
		phone: PhoneNumber.create("+919876543210"),
		email: Email.create("alice@example.com"),
		passwordHash: "hash-1",
		googleId: null,
		status: UserStatus.ACTIVE,
		isEmailVerified: true,
		createdAt: fixedDate,
		updatedAt: fixedDate,
	});

	const sampleUser2 = UserEntity.reconstitute({
		id: "user-2",
		fullName: FullName.create("Bob Builder"),
		phone: null,
		email: Email.create("bob@example.com"),
		passwordHash: "hash-2",
		googleId: null,
		status: UserStatus.INACTIVE,
		isEmailVerified: false,
		createdAt: fixedDate,
		updatedAt: fixedDate,
	});

	beforeEach(() => {
		mockUserRepository = {
			findByEmail: jest.fn(),
			findByPhone: jest.fn(),
			findByGoogleId: jest.fn(),
			findById: jest.fn(),
			createWithSession: jest.fn(),
			updateProfile: jest.fn(),
			findCustomers: jest.fn(),
			countCustomers: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
			findAll: jest.fn(),
			exists: jest.fn(),
		};

		useCase = new ListCustomersUseCase(mockUserRepository);
	});

	it("should return paginated customers with default values when query is empty", async () => {
		mockUserRepository.findCustomers.mockResolvedValue([
			sampleUser1,
			sampleUser2,
		]);
		mockUserRepository.countCustomers.mockResolvedValue(2);

		const result = await useCase.execute({});

		expect(mockUserRepository.findCustomers).toHaveBeenCalledWith({
			status: undefined,
			search: undefined,
			skip: 0,
			take: 20,
			sortBy: "createdAt",
			sortOrder: "DESC",
		});
		expect(mockUserRepository.countCustomers).toHaveBeenCalledWith({
			status: undefined,
			search: undefined,
		});

		expect(result).toEqual({
			items: [
				{
					id: "user-1",
					fullname: "Alice Walker",
					email: "alice@example.com",
					phone: "+919876543210",
					status: UserStatus.ACTIVE,
				},
				{
					id: "user-2",
					fullname: "Bob Builder",
					email: "bob@example.com",
					phone: null,
					status: UserStatus.INACTIVE,
				},
			],
			total: 2,
			page: 1,
			limit: 20,
			totalPages: 1,
		});
	});

	it("should apply status and search filters and calculate correct pagination offset", async () => {
		mockUserRepository.findCustomers.mockResolvedValue([sampleUser1]);
		mockUserRepository.countCustomers.mockResolvedValue(25);

		const result = await useCase.execute({
			status: UserStatus.ACTIVE,
			search: "alice",
			page: 2,
			limit: 10,
			sortBy: "createdAt",
			sortOrder: "ASC",
		});

		expect(mockUserRepository.findCustomers).toHaveBeenCalledWith({
			status: UserStatus.ACTIVE,
			search: "alice",
			skip: 10,
			take: 10,
			sortBy: "createdAt",
			sortOrder: "ASC",
		});
		expect(mockUserRepository.countCustomers).toHaveBeenCalledWith({
			status: UserStatus.ACTIVE,
			search: "alice",
		});

		expect(result.total).toBe(25);
		expect(result.page).toBe(2);
		expect(result.limit).toBe(10);
		expect(result.totalPages).toBe(3);
		expect(result.items).toHaveLength(1);
	});

	it("should cap limit to configured maximum limit", async () => {
		mockUserRepository.findCustomers.mockResolvedValue([]);
		mockUserRepository.countCustomers.mockResolvedValue(0);

		const result = await useCase.execute({
			limit: 500,
		});

		expect(mockUserRepository.findCustomers).toHaveBeenCalledWith(
			expect.objectContaining({
				take: 100,
			}),
		);
		expect(result.limit).toBe(100);
		expect(result.totalPages).toBe(0);
	});

	it("should return empty items array when no customers match criteria", async () => {
		mockUserRepository.findCustomers.mockResolvedValue([]);
		mockUserRepository.countCustomers.mockResolvedValue(0);

		const result = await useCase.execute({
			search: "nonexistent",
		});

		expect(result.items).toEqual([]);
		expect(result.total).toBe(0);
		expect(result.totalPages).toBe(0);
	});
});
