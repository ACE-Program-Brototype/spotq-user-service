import { container, TYPES } from "@config/di";
import { config } from "@config/env.ts";
import { prisma } from "@infrastructure/database/prisma/prisma.ts";
import type { BcryptPasswordHasher } from "@infrastructure/services/password";

const passwordService = container.get<BcryptPasswordHasher>(
	TYPES.PasswordService,
);

async function main() {
	const name = config.admin.name;
	const email = config.admin.email;
	const password = config.admin.password;

	if (!name || !email || !password) {
		throw new Error(
			"ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be provided",
		);
	}

	console.log(email);

	const passwordHash = await passwordService.hashPassword(password);

	const admin = await prisma.platformAdmin.upsert({
		where: {
			email: email.toLowerCase(),
		},
		update: {
			name,
			passwordHash,
		},
		create: {
			name,
			email: email.toLowerCase(),
			passwordHash,
		},
	});

	console.log("Platform admin created/updated:");
	console.log(admin);
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
