import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, LoginUserDto, UpdatePasswordDto } from "./user.dto";

import { PrismaService } from "../prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async create(payload: CreateUserDto):Promise<User> {
		let user = await this.prisma.user.findFirst({
			where: { email: payload.email }
		});
		if (user) {
			throw new HttpException("duplicate email", HttpStatus.CONFLICT);
		}

		user = await this.prisma.user.findFirst({
			where: { nickname: payload.nickname }
		});
		if (user) {
			throw new HttpException("duplicate nickname", HttpStatus.CONFLICT);
		}

		user = await this.prisma.user.findFirst({
			where: { phoneNumber: payload.phoneNumber }
		});
		if (user) {
			throw new HttpException("duplicate phone number", HttpStatus.CONFLICT);
		}

		return await this.prisma.user.create({
			data: {
				...(payload),
				password: payload.password,
				passwordSalt: "test"
			}
		});
	}

	async findUserByLogin(payload: LoginUserDto):Promise<any> {
		let query;
		switch (payload.loginType) {
			case "email":
				query = { email: payload.loginValue };
				break;
			case "nickname":
				query = { nickname: payload.loginValue };
				break;
			case "phoneNumber":
				query = { phoneNumber: payload.loginValue };
				break;
			default:
				throw new HttpException("loginType must be among email, nickname, phoneNumber", HttpStatus.BAD_REQUEST);
		}

		const user = await this.prisma.user.findFirst({
			where: query
		});

		if (!user) {
			throw new HttpException("invalid credentials", HttpStatus.UNAUTHORIZED);
		}

		const passwordMatch = payload.password == user.password;

		if (!passwordMatch) {
			throw new HttpException("invalid credentials", HttpStatus.UNAUTHORIZED);
		}

		const { password: p, ...rest } = user;
		return rest;
	}

	async findUserByPayload(payload: any):Promise<any> {
		return await this.prisma.user.findFirst({
			where: payload
		});
	}

	async updatePassword(payload: UpdatePasswordDto, id: string):Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: {id}
		});

		if (!user) {
			throw new HttpException("invalid credentials", HttpStatus.UNAUTHORIZED);
		}

		const passwordMatch = payload.currentPassword == user.password;

		if (!passwordMatch) {
			throw new HttpException("invalid credentials", HttpStatus.UNAUTHORIZED);
		}

		return await this.prisma.user.update({
			where: {id},
			data: { password: payload.newPassword }
		});
	}
}
