import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto, LoginUserDto } from "../users/user.dto";
import { JwtPayload } from "./jwt.strategy";
import { PrismaService } from "../prisma.service";
import { User } from "@prisma/client";
import { hash } from "bcrypt";

export interface RegistrationStatus {
	success: boolean;
	message: string;
	data?: User;
}

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		private readonly usersService: UsersService,
	) {}

	async register(payload: CreateUserDto):Promise<RegistrationStatus> {
		let status: RegistrationStatus = {
			success: true,
			message: "success"
		};

		try {
			status.data = await this.usersService.create(payload);
		} catch (err) {
			status = {
				success: false,
				message: err
			};
		}

		return status;
	}

	async login(payload: LoginUserDto): Promise<any> {
		const user = await this.usersService.findUserByLogin(payload);

		const token = this._createToken(user);

		return {
			...token,
			data: user
		};
	}

	private _createToken(payload: any) {
		const user: JwtPayload = payload;
		const authorization = this.jwtService.sign(user);

		return {
			expiresIn: process.env.EXPIRES_IN,
			authorization
		};
	}

	async validateUser(payload: JwtPayload):Promise<any>{
		const user = await this.usersService.findUserByPayload(payload);
		if (!user) {
			throw new HttpException("invalid token", HttpStatus.UNAUTHORIZED);
		}
		return user;
	}
}