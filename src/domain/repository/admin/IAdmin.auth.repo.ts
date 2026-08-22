import type { PlatformAdmin, Prisma } from "@prisma/client";
import type { IBaseRepository } from "../base/Ibase.repo";

export interface IAdminAuthRepository
	extends IBaseRepository<
		PlatformAdmin,
		Prisma.PlatformAdminCreateInput,
		Prisma.PlatformAdminUpdateInput,
		Prisma.PlatformAdminWhereInput,
		Prisma.PlatformAdminWhereUniqueInput
	> {
	findByEmail(email: string): Promise<PlatformAdmin | null>;
}
