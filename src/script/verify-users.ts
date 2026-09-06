import { prisma } from "@infrastructure/database/prisma/prisma.ts";

async function main() {
	const result = await prisma.user.updateMany({
		data: {
			isEmailVerified: true,
		},
	});

	console.log(
		`Successfully updated ${result.count} users to email verified (isEmailVerified: true).`,
	);
}

main()
	.catch((error) => {
		console.error("Error updating users:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
