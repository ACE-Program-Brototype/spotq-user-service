import type { IAdminAuthRepository } from "@infrastructure/database/interface/admin/IAdmin.auth.repo.ts";
import { BaseRepository } from "@infrastructure/database/repositories/base/base.repo.ts";
import { prisma } from "@infrastructure/index";
import type { PlatformAdmin, Prisma } from "@prisma/client";

export class AdminAuthRepository
	extends BaseRepository<
		PlatformAdmin,
		Prisma.PlatformAdminCreateInput,
		Prisma.PlatformAdminUpdateInput,
		Prisma.PlatformAdminWhereInput,
		Prisma.PlatformAdminWhereUniqueInput
	>
	implements IAdminAuthRepository
{
	constructor() {
		super(prisma.platformAdmin);
	}

	findByEmail(email: string): Promise<PlatformAdmin | null> {
		return this.model.findUnique({
			where: { email },
		});
	}
}
