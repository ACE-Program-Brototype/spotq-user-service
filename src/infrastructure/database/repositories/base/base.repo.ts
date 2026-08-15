import type { IBaseRepository } from "@infrastructure/database/interface/base/Ibase.repo.ts";

export abstract class BaseRepository<
	TEntity,
	TCreateData,
	TUpdateData,
	TFilter = Partial<TEntity>,
	TUniqueWhere = { id: string },
> implements
		IBaseRepository<TEntity, TCreateData, TUpdateData, TFilter, TUniqueWhere>
{
	protected constructor(
		protected readonly model: {
			findMany(args?: { where?: TFilter }): Promise<TEntity[]>;

			findUnique(args: { where: TUniqueWhere }): Promise<TEntity | null>;

			create(args: { data: TCreateData }): Promise<TEntity>;

			update(args: {
				where: { id: string };
				data: TUpdateData;
			}): Promise<TEntity>;
		},
	) {}

	async find(filter?: TFilter): Promise<TEntity[]> {
		return this.model.findMany({
			where: filter,
		});
	}

	async findById(id: string): Promise<TEntity | null> {
		return this.model.findUnique({
			where: { id } as TUniqueWhere,
		});
	}

	async create(data: TCreateData): Promise<TEntity> {
		return this.model.create({
			data,
		});
	}

	async update(id: string, data: TUpdateData): Promise<TEntity | null> {
		return this.model.update({
			where: { id },
			data,
		});
	}
}
