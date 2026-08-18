import { injectable } from "inversify";
import type { ILogger } from "@application/ports/services/logger.interface.ts";
import { logger } from "@infrastructure/logger/logger.ts";

@injectable()
export class PinoLoggerService implements ILogger {
	public info(mergObj: object, message?: string, ...args: any[]): void;
	public info(message: string, ...args: any[]): void;
	public info(msgOrObj: string | object, message?: string, ...args: any[]): void {
		if (typeof msgOrObj === "string") {
			logger.info(msgOrObj, ...args);
		} else {
			logger.info(msgOrObj, message, ...args);
		}
	}

	public error(mergObj: object, message?: string, ...args: any[]): void;
	public error(message: string, ...args: any[]): void;
	public error(msgOrObj: string | object, message?: string, ...args: any[]): void {
		if (typeof msgOrObj === "string") {
			logger.error(msgOrObj, ...args);
		} else {
			logger.error(msgOrObj, message, ...args);
		}
	}

	public warn(mergObj: object, message?: string, ...args: any[]): void;
	public warn(message: string, ...args: any[]): void;
	public warn(msgOrObj: string | object, message?: string, ...args: any[]): void {
		if (typeof msgOrObj === "string") {
			logger.warn(msgOrObj, ...args);
		} else {
			logger.warn(msgOrObj, message, ...args);
		}
	}
}
