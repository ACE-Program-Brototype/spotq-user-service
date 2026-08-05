import { config } from "@config/env.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg(config.database.directUrl);

export const prisma = new PrismaClient({
	adapter,
	log: ["warn", "error"],
});
