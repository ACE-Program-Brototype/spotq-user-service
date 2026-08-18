export interface ILogger {
	info(mergObj: object, message?: string, ...args: any[]): void;
	info(message: string, ...args: any[]): void;
	error(mergObj: object, message?: string, ...args: any[]): void;
	error(message: string, ...args: any[]): void;
	warn(mergObj: object, message?: string, ...args: any[]): void;
	warn(message: string, ...args: any[]): void;
}
