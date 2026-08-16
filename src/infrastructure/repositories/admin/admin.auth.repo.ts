import type { IAdminAuthRepository } from "@infrastructure/interface/admin/IAdmin.auth.repo";
import { BaseRepository } from "@infrastructure/repositories/base/base.repo";
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
