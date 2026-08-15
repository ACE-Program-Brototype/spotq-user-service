import { HttpStatus } from "@shared/constants";

export class ApiResponse<T = undefined> {
	readonly success: boolean;
	readonly statusCode: number;
	readonly message: string;
	readonly data?: T;
	readonly error?: string;

	private constructor(params: {
		success: boolean;
		statusCode: number;
		message: string;
		data?: T;
		error?: string;
	}) {
		this.success = params.success;
		this.statusCode = params.statusCode;
		this.message = params.message;
		this.data = params.data;
		this.error = params.error;
	}

	/**
	 * Build a successful response envelope.
	 *
	 * @param data     - Payload to include under `data`.
	 * @param message  - Human-readable success message (defaults to "OK").
	 * @param statusCode - HTTP status code (defaults to 200).
	 */
	static ok<T>(
		data: T,
		message = "OK",
		statusCode = HttpStatus.OK,
	): ApiResponse<T> {
		return new ApiResponse<T>({ success: true, statusCode, message, data });
	}

	/**
	 * Build a failure response envelope.
	 *
	 * @param message   - Human-readable description of the error.
	 * @param statusCode - HTTP status code (e.g. 400, 404, 500).
	 * @param error     - Optional short error label (e.g. "Not Found").
	 *                    Omit this in production for 5xx responses to avoid
	 *                    leaking implementation details.
	 */
	static fail(
		message: string,
		statusCode: number,
		error?: string,
	): ApiResponse<never> {
		return new ApiResponse<never>({
			success: false,
			statusCode,
			message,
			error,
		});
	}
}
