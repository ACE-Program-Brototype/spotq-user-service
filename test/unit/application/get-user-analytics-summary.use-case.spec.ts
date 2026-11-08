import { GetUserAnalyticsSummaryUseCase } from "@application/use-cases/internal/get-user-analytics-summary.use-case.ts";
import type { IUserRepository } from "@domain/repositories/user.repository.interface.ts";

describe("GetUserAnalyticsSummaryUseCase", () => {
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let useCase: GetUserAnalyticsSummaryUseCase;

	beforeEach(() => {
		mockUserRepository = {
			countCustomers: jest.fn(),
			findCustomers: jest.fn(),
			findByEmail: jest.fn(),
			findByPhone: jest.fn(),
			findByGoogleId: jest.fn(),
			findById: jest.fn(),
			createWithSession: jest.fn(),
			updateProfile: jest.fn(),
			updateStatus: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
			findAll: jest.fn(),
			exists: jest.fn(),
		};

		useCase = new GetUserAnalyticsSummaryUseCase(mockUserRepository);
	});

	it("should return total registered customers count from repository", async () => {
		mockUserRepository.countCustomers.mockResolvedValue(12500);

		const result = await useCase.execute();

		expect(mockUserRepository.countCustomers).toHaveBeenCalledTimes(1);
		expect(mockUserRepository.countCustomers).toHaveBeenCalledWith({});
		expect(result).toEqual({ totalRegisteredCustomers: 12500 });
	});

	it("should propagate error when repository countCustomers fails", async () => {
		const dbError = new Error("Database connection pool timeout");
		mockUserRepository.countCustomers.mockRejectedValue(dbError);

		await expect(useCase.execute()).rejects.toThrow(dbError);
		expect(mockUserRepository.countCustomers).toHaveBeenCalledTimes(1);
		expect(mockUserRepository.countCustomers).toHaveBeenCalledWith({});
	});
});
