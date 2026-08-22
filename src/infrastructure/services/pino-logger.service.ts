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
			logger.info(msgOrObj, ...(args as never[]));
		} else {
			logger.info(msgOrObj, message, ...(args as never[]));
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
			logger.error(msgOrObj, ...(args as never[]));
		} else {
			logger.error(msgOrObj, message, ...(args as never[]));
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
			logger.warn(msgOrObj, ...(args as never[]));
		} else {
			logger.warn(msgOrObj, message, ...(args as never[]));
		}
	}
}
