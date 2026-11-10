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

	it("should return total and period counts with default fallback when no query provided", async () => {
		mockUserRepository.countCustomers
			.mockResolvedValueOnce(12500)
			.mockResolvedValueOnce(48);

		const result = await useCase.execute();

		expect(mockUserRepository.countCustomers).toHaveBeenCalledTimes(2);
		expect(mockUserRepository.countCustomers).toHaveBeenNthCalledWith(1, {});
		const secondCallArg = mockUserRepository.countCustomers.mock.calls[1][0];
		expect(secondCallArg.createdAt).toBeDefined();
		expect(secondCallArg.createdAt?.gte).toBeInstanceOf(Date);
		expect(secondCallArg.createdAt?.lte).toBeInstanceOf(Date);
		expect(result).toEqual({
			totalRegisteredCustomers: 12500,
			newCustomersInPeriod: 48,
		});
	});

	it("should resolve date range correctly for period=DAY", async () => {
		mockUserRepository.countCustomers
			.mockResolvedValueOnce(12500)
			.mockResolvedValueOnce(15);

		const result = await useCase.execute({
			period: "DAY",
			day: 9,
			month: 11,
			year: 2026,
		});

		expect(mockUserRepository.countCustomers).toHaveBeenCalledTimes(2);
		const secondCallArg = mockUserRepository.countCustomers.mock.calls[1][0];
		const gte = secondCallArg.createdAt?.gte as Date;
		const lte = secondCallArg.createdAt?.lte as Date;
		expect(gte.getFullYear()).toBe(2026);
		expect(gte.getMonth()).toBe(10); // November (0-indexed)
		expect(gte.getDate()).toBe(9);
		expect(gte.getHours()).toBe(0);
		expect(lte.getDate()).toBe(9);
		expect(lte.getHours()).toBe(23);
		expect(result.newCustomersInPeriod).toBe(15);
	});

	it("should resolve date range correctly for period=MONTH", async () => {
		mockUserRepository.countCustomers
			.mockResolvedValueOnce(12500)
			.mockResolvedValueOnce(180);

		const result = await useCase.execute({
			period: "MONTH",
			month: 11,
			year: 2026,
		});

		const secondCallArg = mockUserRepository.countCustomers.mock.calls[1][0];
		const gte = secondCallArg.createdAt?.gte as Date;
		const lte = secondCallArg.createdAt?.lte as Date;
		expect(gte.getFullYear()).toBe(2026);
		expect(gte.getMonth()).toBe(10);
		expect(gte.getDate()).toBe(1);
		expect(lte.getFullYear()).toBe(2026);
		expect(lte.getMonth()).toBe(10);
		expect(lte.getDate()).toBe(30); // November has 30 days
		expect(result.newCustomersInPeriod).toBe(180);
	});

	it("should resolve date range correctly for period=YEAR", async () => {
		mockUserRepository.countCustomers
			.mockResolvedValueOnce(12500)
			.mockResolvedValueOnce(1200);

		const result = await useCase.execute({
			period: "YEAR",
			year: 2026,
		});

		const secondCallArg = mockUserRepository.countCustomers.mock.calls[1][0];
		const gte = secondCallArg.createdAt?.gte as Date;
		const lte = secondCallArg.createdAt?.lte as Date;
		expect(gte.getFullYear()).toBe(2026);
		expect(gte.getMonth()).toBe(0); // Jan 1
		expect(gte.getDate()).toBe(1);
		expect(lte.getFullYear()).toBe(2026);
		expect(lte.getMonth()).toBe(11); // Dec 31
		expect(lte.getDate()).toBe(31);
		expect(result.newCustomersInPeriod).toBe(1200);
	});

	it("should resolve date range correctly for period=WEEK", async () => {
		mockUserRepository.countCustomers
			.mockResolvedValueOnce(12500)
			.mockResolvedValueOnce(45);

		// Nov 9, 2026 is a Monday
		const result = await useCase.execute({
			period: "WEEK",
			day: 9,
			month: 11,
			year: 2026,
		});

		const secondCallArg = mockUserRepository.countCustomers.mock.calls[1][0];
		const gte = secondCallArg.createdAt?.gte as Date;
		const lte = secondCallArg.createdAt?.lte as Date;
		expect(gte.getDate()).toBe(9); // Monday Nov 9
		expect(lte.getDate()).toBe(15); // Sunday Nov 15
		expect(result.newCustomersInPeriod).toBe(45);
	});

	it("should return 0 when no customers joined in period", async () => {
		mockUserRepository.countCustomers
			.mockResolvedValueOnce(12500)
			.mockResolvedValueOnce(0);

		const result = await useCase.execute({
			period: "DAY",
			day: 1,
			month: 1,
			year: 2020,
		});

		expect(result.newCustomersInPeriod).toBe(0);
	});

	it("should propagate error when repository countCustomers fails", async () => {
		const dbError = new Error("Database connection pool timeout");
		mockUserRepository.countCustomers.mockRejectedValue(dbError);

		await expect(useCase.execute()).rejects.toThrow(dbError);
	});
});
