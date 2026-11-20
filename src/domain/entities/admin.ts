export class Admin {
	constructor(
		readonly _id: string,
		private _name: string,
		private _email: string,
		private _passwordHash: string,
		private _createdAt: Date,
		private _updatedAt: Date,
	) {}

	get id(): string {
		return this._id;
	}

	get name(): string {
		return this._name;
	}

	get email(): string {
		return this._email;
	}

	get passwordHash(): string {
		return this._passwordHash;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}
}
