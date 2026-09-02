import fs from "node:fs";
import path from "node:path";
import { config } from "@config/env.ts";
import { logger } from "@infrastructure/logger/logger.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

// Ensure all PostgreSQL timestamp types are parsed as UTC
// OID 1114: TIMESTAMP (without time zone) -> parse as UTC ISO
pg.types.setTypeParser(
	1114,
	(stringValue: string) => new Date(`${stringValue}Z`),
);
// OID 1184: TIMESTAMPTZ (with time zone) -> parse directly into Date
pg.types.setTypeParser(1184, (stringValue: string) => new Date(stringValue));

// Setup secure SSL/TLS configuration.
// pg.Pool handles the actual connection — sslmode URL params are not needed
// because we're using the PrismaPg driver adapter (no Prisma query engine).
let ssl:
	| (pg.PoolConfig["ssl"] & { rejectUnauthorized?: boolean; ca?: string })
	| undefined;

if (config.database.sslEnabled) {
	let caContent: string | undefined;
	const envCaCert = config.database.caCert;

	if (envCaCert) {
		if (envCaCert.includes("BEGIN CERTIFICATE")) {
			// Direct PEM certificate content passed via environment variable / Infisical
			caContent = envCaCert.replace(/\\n/g, "\n");
		} else {
			// File path to certificate
			try {
				caContent = fs.readFileSync(envCaCert, "utf8");
			} catch (error) {
				logger.fatal(
					{ err: error },
					`Failed to read database CA certificate from env path: ${envCaCert}`,
				);
				throw error;
			}
		}
	} else {
		// Fallback to .certs/ca.pem
		const defaultCertPath = path.resolve(process.cwd(), ".certs", "ca.pem");
		try {
			if (fs.existsSync(defaultCertPath)) {
				caContent = fs.readFileSync(defaultCertPath, "utf8");
			}
		} catch (_error) {
			logger.warn(
				`Could not read default CA cert at ${defaultCertPath}, continuing without custom CA.`,
			);
		}
	}

	ssl = { rejectUnauthorized: true };
	if (caContent) {
		ssl.ca = caContent;
	}
} else {
	// Aiven (and most cloud DBs) mandate SSL even when strict verification is off.
	// rejectUnauthorized:false allows SSL without CA cert verification (dev/test only).
	ssl = { rejectUnauthorized: false };
}

const poolUrl = new URL(config.database.url);
poolUrl.searchParams.delete("sslmode");

const pool = new pg.Pool({
	connectionString: poolUrl.toString(),
	ssl,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
	adapter,
	log: ["warn", "error"],
});
