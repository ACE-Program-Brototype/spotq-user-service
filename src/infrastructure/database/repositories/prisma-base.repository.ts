import type { IBaseRepository } from "@domain/repositories/base.repository.interface.ts";
import { injectable } from "inversify";

export interface IPrismaModelDelegate<
	TModel,
	TCreateInput = unknown,
	TUpdateInput = unknown,
> {
	findMany(): Promise<TModel[]>;
	findUnique(args: { where: { id: string } }): Promise<TModel | null>;
	create(args: { data: TCreateInput }): Promise<TModel>;
	update(args: { where: { id: string }; data: TUpdateInput }): Promise<TModel>;
	delete(args: { where: { id: string } }): Promise<TModel>;
}

@injectable()
export abstract class PrismaBaseRepository<
	T,
	TModel,
	TCreateInput = unknown,
	TUpdateInput = unknown,
> implements IBaseRepository<T>
{
	constructor(
		protected readonly dbModel: IPrismaModelDelegate<
			TModel,
			TCreateInput,
			TUpdateInput
		>,
		protected readonly mapper: {
			toDomain(raw: TModel): T;
			toPersistence(entity: T): TCreateInput;
		},
	) {}

	public async find(): Promise<T[]> {
		const records = await this.dbModel.findMany();
		return records.map((record: TModel) => this.mapper.toDomain(record));
	}

	public async findById(id: string): Promise<T | null> {
		const record = await this.dbModel.findUnique({
			where: { id },
		});
		return record ? this.mapper.toDomain(record) : null;
	}

	public async create(entity: T): Promise<T> {
		const data = this.mapper.toPersistence(entity);
		const record = await this.dbModel.create({ data });
		return this.mapper.toDomain(record);
	}

	public async update(id: string, entity: T): Promise<T> {
		const data = this.mapper.toPersistence(entity) as unknown as TUpdateInput;
		const record = await this.dbModel.update({
			where: { id },
			data,
		});
		return this.mapper.toDomain(record);
	}

	public async delete(id: string): Promise<boolean> {
		try {
			await this.dbModel.delete({
				where: { id },
			});
			return true;
		} catch {
			return false;
		}
	}
}
