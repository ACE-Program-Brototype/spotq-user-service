export interface IBaseRepository<
	TEntity,
	TCreateData,
	TUpdateData,
	TFilter = Partial<TEntity>,
	_TUniqueWhere = { id: string },
> {
	find(filter?: TFilter): Promise<TEntity[]>;

	findById(id: string): Promise<TEntity | null>;

	create(data: TCreateData): Promise<TEntity>;

	update(id: string, data: TUpdateData): Promise<TEntity | null>;
}
