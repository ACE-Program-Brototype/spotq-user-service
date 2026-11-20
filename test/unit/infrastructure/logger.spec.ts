import { Writable } from "node:stream";
import {
	createLogger,
	loggerLocalStorage,
} from "@infrastructure/logger/index.ts";

describe("Universal Structured JSON Logger", () => {
	let logOutput: Record<string, unknown>[] = [];
	let testLogger: ReturnType<typeof createLogger>;

	beforeEach(() => {
		logOutput = [];
		const stream = new Writable({
			write(chunk, _encoding, callback) {
				const str = chunk.toString().trim();
				if (str.startsWith("{") && str.endsWith("}")) {
					try {
						logOutput.push(JSON.parse(str));
					} catch {
						// ignore non-json chunks
					}
				}
				callback();
			},
		});
		testLogger = createLogger(stream);
	});

	it("should emit single-line JSON adhering to the 6 core blocks", () => {
		loggerLocalStorage.run(
			{
				correlationId: "req-9a8b7c6d-5e4f",
				requestId: "req-9a8b7c6d-5e4f",
				traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
				spanId: "00f067aa0ba902b7",
			},
			() => {
				testLogger.info(
					{
						context: {
							restaurant_id: "5dc5f92c-03b9-4eb1-85f5-88bf4159f0c8",
							customer_id: "163a57cb-6f3b-4188-8a9b-977f682f70e0",
							order_id: "ord_88291039",
						},
						http: {
							method: "POST",
							path: "/api/v1/orders",
							status_code: 201,
							duration_ms: 42.5,
							client_ip: "103.21.244.12",
						},
					},
					"Order created successfully",
				);
			},
		);

		expect(logOutput.length).toBe(1);
		const log = logOutput[0] as Record<string, unknown>;

		expect(log.level).toBe("INFO");
		expect(log.message).toBe("Order created successfully");
		expect(typeof log.timestamp).toBe("string");
		expect(log.service).toEqual({
			name: expect.any(String),
			version: expect.any(String),
			environment: expect.any(String),
		});
		expect(log.trace).toEqual({
			correlation_id: "req-9a8b7c6d-5e4f",
			trace_id: "4bf92f3577b34da6a3ce929d0e0e4736",
			span_id: "00f067aa0ba902b7",
		});
		expect(log.http).toEqual({
			method: "POST",
			path: "/api/v1/orders",
			status_code: 201,
			duration_ms: 42.5,
			client_ip: "103.21.244.12",
		});
		expect(log.context).toEqual({
			restaurant_id: "5dc5f92c-03b9-4eb1-85f5-88bf4159f0c8",
			customer_id: "163a57cb-6f3b-4188-8a9b-977f682f70e0",
			order_id: "ord_88291039",
		});
	});

	it("should format Log Type 1: HTTP Access Request Log", () => {
		loggerLocalStorage.run(
			{
				correlationId: "74939645-acb7-4d8d-9169-45ac8efaf67e",
				requestId: "74939645-acb7-4d8d-9169-45ac8efaf67e",
			},
			() => {
				testLogger.info(
					{
						http: {
							method: "POST",
							path: "/api/v1/orders",
							status_code: 201,
							duration_ms: 42.5,
						},
					},
					"HTTP POST /api/v1/orders 201 (42.5ms)",
				);
			},
		);

		expect(logOutput.length).toBe(1);
		const log = logOutput[0] as Record<string, unknown>;

		expect(log.level).toBe("INFO");
		expect(log.message).toBe("HTTP POST /api/v1/orders 201 (42.5ms)");
		expect(log.http).toEqual({
			method: "POST",
			path: "/api/v1/orders",
			status_code: 201,
			duration_ms: 42.5,
		});
		expect(log.trace).toEqual({
			correlation_id: "74939645-acb7-4d8d-9169-45ac8efaf67e",
		});
	});

	it("should format Log Type 2: Application Error Log with dedicated error object", () => {
		const dbError = new Error(
			"Too many database connections opened: remaining connection slots are reserved",
		);
		(dbError as unknown as { code: string }).code = "P2037";
		dbError.name = "PrismaClientKnownRequestError";

		loggerLocalStorage.run(
			{
				correlationId: "74939645-acb7-4d8d-9169-45ac8efaf67e",
				requestId: "74939645-acb7-4d8d-9169-45ac8efaf67e",
			},
			() => {
				testLogger.error(
					{
						err: dbError,
						context: {
							restaurant_id: "5dc5f92c-03b9-4eb1-85f5-88bf4159f0c8",
						},
					},
					"Database transaction failed while creating order",
				);
			},
		);

		expect(logOutput.length).toBe(1);
		const log = logOutput[0] as Record<string, unknown>;

		expect(log.level).toBe("ERROR");
		expect(log.message).toBe(
			"Database transaction failed while creating order",
		);
		expect(log.error).toEqual(
			expect.objectContaining({
				name: "PrismaClientKnownRequestError",
				code: "P2037",
				message:
					"Too many database connections opened: remaining connection slots are reserved",
				stack: expect.any(String),
			}),
		);
		expect(log.context).toEqual({
			restaurant_id: "5dc5f92c-03b9-4eb1-85f5-88bf4159f0c8",
		});
	});

	it("should format Log Type 3: Business / Domain Event Log", () => {
		loggerLocalStorage.run(
			{
				correlationId: "74939645-acb7-4d8d-9169-45ac8efaf67e",
				requestId: "74939645-acb7-4d8d-9169-45ac8efaf67e",
			},
			() => {
				testLogger.info(
					{
						event: {
							action: "PAYMENT_CAPTURED",
							provider: "razorpay",
							amount: 450.0,
							currency: "INR",
						},
					},
					"Customer payment captured",
				);
			},
		);

		expect(logOutput.length).toBe(1);
		const log = logOutput[0] as Record<string, unknown>;

		expect(log.level).toBe("INFO");
		expect(log.message).toBe("Customer payment captured");
		expect(log.event).toEqual({
			action: "PAYMENT_CAPTURED",
			provider: "razorpay",
			amount: 450.0,
			currency: "INR",
		});
	});

	it("should format Log Type 4: Background Broker / Job Log", () => {
		loggerLocalStorage.run(
			{
				correlationId: "74939645-acb7-4d8d-9169-45ac8efaf67e",
				requestId: "74939645-acb7-4d8d-9169-45ac8efaf67e",
			},
			() => {
				testLogger.info(
					{
						job: {
							queue: "order_events",
							routing_key: "order.created",
							duration_ms: 14.2,
							status: "SUCCESS",
						},
					},
					"Processed queue message 'order.created'",
				);
			},
		);

		expect(logOutput.length).toBe(1);
		const log = logOutput[0] as Record<string, unknown>;

		expect(log.level).toBe("INFO");
		expect(log.message).toBe("Processed queue message 'order.created'");
		expect(log.job).toEqual({
			queue: "order_events",
			routing_key: "order.created",
			duration_ms: 14.2,
			status: "SUCCESS",
		});
	});

	it("should automatically extract dynamic IDs into context block", () => {
		testLogger.info(
			{
				userId: "usr_12345",
				deviceId: "dev_67890",
				jobId: "job_555",
			},
			"User checked out",
		);

		expect(logOutput.length).toBe(1);
		const log = logOutput[0] as Record<string, unknown>;

		expect(log.context).toEqual({
			user_id: "usr_12345",
			device_id: "dev_67890",
			job_id: "job_555",
		});
	});

	it("should redact sensitive information such as password and tokens", () => {
		testLogger.info(
			{
				password: "super_secret_password",
				token: "jwt_bearer_token",
				otp: "123456",
				context: {
					password: "nested_password",
					token: "nested_token",
				},
			},
			"Sensitive log attempt",
		);

		expect(logOutput.length).toBe(1);
		const log = logOutput[0] as Record<string, unknown>;

		expect(log.password).toBe("[REDACTED]");
		expect(log.token).toBe("[REDACTED]");
		expect(log.otp).toBe("[REDACTED]");
		expect((log.context as Record<string, unknown>).password).toBe(
			"[REDACTED]",
		);
		expect((log.context as Record<string, unknown>).token).toBe("[REDACTED]");
	});
});
