import type { ILogger } from "@application/ports/services/logger.interface.ts";
import { logger } from "@infrastructure/logger/logger.ts";
import { injectable } from "inversify";

@injectable()
export class PinoLoggerService implements ILogger {
	public info(mergObj: object, message?: string, ...args: unknown[]): void;
	public info(message: string, ...args: unknown[]): void;
	public info(
		msgOrObj: string | object,
		message?: string,
		...args: unknown[]
	): void {
		if (typeof msgOrObj === "string") {
			logger.info(msgOrObj, ...args);
		} else {
			logger.info(msgOrObj, message, ...args);
		}
	}

	public error(mergObj: object, message?: string, ...args: unknown[]): void;
	public error(message: string, ...args: unknown[]): void;
	public error(
		msgOrObj: string | object,
		message?: string,
		...args: unknown[]
	): void {
		if (typeof msgOrObj === "string") {
			logger.error(msgOrObj, ...args);
		} else {
			logger.error(msgOrObj, message, ...args);
		}
	}

	public warn(mergObj: object, message?: string, ...args: unknown[]): void;
	public warn(message: string, ...args: unknown[]): void;
	public warn(
		msgOrObj: string | object,
		message?: string,
		...args: unknown[]
	): void {
		if (typeof msgOrObj === "string") {
			logger.warn(msgOrObj, ...args);
		} else {
			logger.warn(msgOrObj, message, ...args);
		}
	}
}
