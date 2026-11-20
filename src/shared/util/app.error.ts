export class AppError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number,
		public readonly error?: string,
	) {
		super(message);

		this.name = "AppError";

		Object.setPrototypeOf(this, new.target.prototype);
	}
}
