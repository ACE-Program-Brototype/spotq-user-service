import type { IHealthCheckable } from "@infrastructure/health/health.interface.ts";
import { injectable } from "inversify";
import { prisma } from "./prisma.ts";

@injectable()
export class PrismaService implements IHealthCheckable {
	async connect(): Promise<void> {
		await prisma.$connect();
		await prisma.$queryRaw`SELECT 1`;
	}

	async disconnect(): Promise<void> {
		await prisma.$disconnect();
	}

	async isHealthy(): Promise<boolean> {
		try {
			await prisma.$queryRaw`SELECT 1`;
			return true;
		} catch {
			return false;
		}
	}
}
