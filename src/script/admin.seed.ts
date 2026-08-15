import { config } from "@config/env.ts";
import { prisma } from "@infrastructure/database/prisma/prisma.ts";
import { hashPassword } from "@infrastructure/services/password.ts";

async function main() {
	const name = config.admin.name;
	const email = config.admin.email;
	const password = config.admin.password;

	if (!name || !email || !password) {
		throw new Error(
			"ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be provided",
		);
	}

	const passwordHash = await hashPassword(password);

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
