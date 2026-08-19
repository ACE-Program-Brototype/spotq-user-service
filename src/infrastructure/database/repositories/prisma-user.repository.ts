import type { UserEntity } from "@domain/entities/user.entity.ts";
import {
	EmailAlreadyExistsError,
	PhoneAlreadyExistsError,
} from "@domain/errors/domain.error.ts";
import type {
	CreateUserWithSessionParams,
	IUserRepository,
} from "@domain/repositories/user.repository.interface.ts";
import type { Email } from "@domain/value-objects/email.vo.ts";
import type { PhoneNumber } from "@domain/value-objects/phone-number.vo.ts";
import { prisma } from "@infrastructure/database/prisma/prisma.ts";
import {
	Prisma,
	type User as PrismaUserModel,
	type UserStatus as PrismaUserStatus,
} from "@prisma/client";
import { injectable } from "inversify";
import { UserMapper } from "../mappers/user.mapper.ts";
import { PrismaBaseRepository } from "./prisma-base.repository.ts";

@injectable()
export class PrismaUserRepository
	extends PrismaBaseRepository<
		UserEntity,
		PrismaUserModel,
		Prisma.UserCreateInput,
		Prisma.UserUpdateInput
	>
	implements IUserRepository
{
	constructor() {
		super(prisma.user, UserMapper);
	}

	public async findByEmail(email: Email | string): Promise<UserEntity | null> {
		const emailStr = typeof email === "string" ? email : email.getValue();
		const record = await prisma.user.findUnique({
			where: { email: emailStr },
			include: { profile: true },
		});

		return record ? UserMapper.toDomain(record) : null;
	}

	public async findByPhone(
		phone: PhoneNumber | string,
	): Promise<UserEntity | null> {
		const phoneStr = typeof phone === "string" ? phone : phone.getValue();
		const record = await prisma.user.findUnique({
			where: { phone: phoneStr },
			include: { profile: true },
		});

		return record ? UserMapper.toDomain(record) : null;
	}

	public async findById(id: string): Promise<UserEntity | null> {
		const record = await prisma.user.findUnique({
			where: { id },
			include: { profile: true },
		});

		return record ? UserMapper.toDomain(record) : null;
	}

	public async findByGoogleId(googleId: string): Promise<UserEntity | null> {
		const record = await prisma.user.findFirst({
			where: { googleId },
			include: { profile: true },
		});

		return record ? UserMapper.toDomain(record) : null;
	}

	public async createWithSession(
		params: CreateUserWithSessionParams,
	): Promise<UserEntity> {
		try {
			const result = await prisma.$transaction(async (tx) => {
				// 1. Create User record
				const createdUser = await tx.user.create({
					data: {
						id: params.user.id,
						fullname: params.user.fullName.getValue(),
						phone: params.user.phone?.getValue() ?? null,
						email: params.user.email.getValue(),
						passwordHash: params.user.passwordHash,
						googleId: params.user.googleId,
						status: params.user.status as PrismaUserStatus,
					},
				});

				// 2. Create UserProfile if present on the UserEntity
				if (params.user.profile) {
					await tx.userProfile.create({
						data: {
							id: params.user.profile.id,
							userId: createdUser.id,
							avatarUrl: params.user.profile.avatarUrl,
							dob: params.user.profile.dob,
							gender: params.user.profile.gender,
							location: params.user.profile.location,
						},
					});
				}

				// 3. Create Device record if provided
				let deviceId: string | null = null;
				if (params.device) {
					const createdDevice = await tx.device.create({
						data: {
							id: params.device.id,
							userId: createdUser.id,
							fcmToken: params.device.fcmToken,
							deviceName: params.device.deviceName,
							platform: params.device.platform,
							lastLogin: params.device.lastLogin,
						},
					});
					deviceId = createdDevice.id;
				}

				// 4. Create initial RefreshToken record
				await tx.refreshToken.create({
					data: {
						id: params.refreshToken.id,
						userId: createdUser.id,
						deviceId,
						tokenHash: params.refreshToken.tokenHash,
						expiresAt: params.refreshToken.expiresAt,
						revokedAt: null,
					},
				});

				// Re-fetch created user with its profile to return fully populated object
				return tx.user.findUnique({
					where: { id: createdUser.id },
					include: { profile: true },
				});
			});

			if (!result) {
				throw new Error(
					"Failed to retrieve created user record from transaction",
				);
			}

			return UserMapper.toDomain(result);
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				const target = Array.isArray(error.meta?.target)
					? error.meta.target.join(",")
					: String(error.meta?.target ?? "");

				if (target.includes("email")) {
					throw new EmailAlreadyExistsError();
				}
				if (target.includes("phone")) {
					throw new PhoneAlreadyExistsError();
				}
				throw new EmailAlreadyExistsError(
					"An account with this email or phone number already exists.",
				);
			}
			throw error;
		}
	}
}
