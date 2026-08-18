import type { IBaseRepository } from "@domain/repositories/base.repository.interface.ts";
import { injectable } from "inversify";

@injectable()
export abstract class PrismaBaseRepository<T, TModel>
	implements IBaseRepository<T>
{
	constructor(
		protected readonly dbModel: any,
		protected readonly mapper: {
			toDomain(raw: TModel): T;
			toPersistence(entity: T): any;
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
		const data = this.mapper.toPersistence(entity);
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
