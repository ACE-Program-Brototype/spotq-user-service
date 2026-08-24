import { UserProfileEntity } from "@domain/entities/user-profile.entity.ts";

describe("UserProfileEntity", () => {
	it("should create a new user profile correctly with default null properties", () => {
		const profile = UserProfileEntity.create({
			id: "prof-123",
			userId: "usr-123",
			avatarUrl: "https://example.com/avatar.jpg",
		});

		expect(profile.id).toBe("prof-123");
		expect(profile.userId).toBe("usr-123");
		expect(profile.avatarUrl).toBe("https://example.com/avatar.jpg");
		expect(profile.dob).toBeNull();
		expect(profile.gender).toBeNull();
		expect(profile.location).toBeNull();
		expect(profile.createdAt).toBeInstanceOf(Date);
	});

	it("should reconstitute an existing profile entity", () => {
		const createdDate = new Date();
		const profile = UserProfileEntity.reconstitute({
			id: "prof-123",
			userId: "usr-123",
			avatarUrl: "https://example.com/avatar.jpg",
			dob: new Date("2000-01-01"),
			gender: "Male",
			location: "New York",
			createdAt: createdDate,
			updatedAt: createdDate,
		});

		expect(profile.dob).toEqual(new Date("2000-01-01"));
		expect(profile.gender).toBe("Male");
		expect(profile.location).toBe("New York");
		expect(profile.createdAt).toBe(createdDate);
	});
});
