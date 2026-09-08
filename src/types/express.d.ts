import "express";

declare global {
	namespace Express {
		interface Request {
			userId?: string;
			user?: {
				userId: string;
				email?: string;
				role?: string;
			};
		}
	}
}
