import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from "@nestjs/jwt";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, LoginUserDto, ResetPasswordDto } from "./dto";
import { User } from "@prisma/client";
import { JwtPayload, Tokens } from './types';

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		private readonly config: ConfigService,
	) {}

	async register(payload: CreateUserDto):Promise<Tokens> {
		const phoneCodeId = await this.checkPhoneVerifiedRecord(payload.phoneNumber, payload.code);
		if (!phoneCodeId) {
			throw new HttpException("verify phone number first", HttpStatus.FORBIDDEN);
		}

		// prepend randomly generated salt for increased safety
		const salt = (Math.random().toString(36)+'00000000000000000').slice(2, 10);
		const hash = await argon.hash(salt + payload.password);

		let user = await this.prisma.user.findUnique({
			where: { email: payload.email }
		});
		if (user) {
			throw new HttpException("duplicate email", HttpStatus.CONFLICT);
		}

		user = await this.prisma.user.findUnique({
			where: { nickname: payload.nickname }
		});
		if (user) {
			throw new HttpException("duplicate nickname", HttpStatus.CONFLICT);
		}

		user = await this.prisma.user.findUnique({
			where: { phoneNumber: payload.phoneNumber }
		});
		if (user) {
			throw new HttpException("duplicate phone number", HttpStatus.CONFLICT);
		}

		const {code, ...result} = payload;

		// create user
		user = await this.prisma.user.create({
			data: {
				...result,
				password: hash,
				passwordSalt: salt,
			},
		}).catch((error) => {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new HttpException("cannot create user with info", HttpStatus.FORBIDDEN);
				}
			}
			throw error;
		});

		// update status of phone verification code
		await this.prisma.phoneVerificationCode.update({
			where: {
				id: phoneCodeId,
			},
			data: {
				status: 3,
			},
		});

		const tokens = await this.getTokens(user.id, user.email)
		await this.updateRefreshToken(user.id, tokens.refreshToken);

		return tokens;
	}

	async login(payload: LoginUserDto): Promise<Tokens> {
		// support for different sign in methods
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

		const user = await this.prisma.user.findUnique({
			where: query
		});

		if (!user) {
			throw new HttpException("invalid credentials", HttpStatus.UNAUTHORIZED);
		}

		const passwordMatches = await argon.verify(user.password, user.passwordSalt + payload.password);
		if (!passwordMatches) {
			throw new HttpException("invalid credentials", HttpStatus.UNAUTHORIZED);
		}

		const tokens = await this.getTokens(user.id, user.email);
    	await this.updateRefreshToken(user.id, tokens.refreshToken);

		return tokens;
	}

	async logout(userId: string): Promise<boolean> {
		await this.prisma.user.updateMany({
			where: {
				id: userId,
				authToken: {
					not: null,
				},
			},
			data: {
				authToken: null,
			},
		});
		return true;
	}

	async refreshTokens(userId: string, refreshToken): Promise<Tokens> {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (!user || !user.authToken) {
			throw new HttpException("invalid user info", HttpStatus.UNAUTHORIZED);
		}

		const refreshTokenMatches = await argon.verify(user.authToken, refreshToken);
		if (!refreshTokenMatches) {
			throw new HttpException("access denied", HttpStatus.FORBIDDEN);
		}

		const tokens = await this.getTokens(user.id, user.email);
		await this.updateRefreshToken(user.id, tokens.refreshToken);

		return tokens;
	}

	async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
		const hash = await argon.hash(refreshToken);
		await this.prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				authToken: hash,
			},
		});
	}

	async getTokens(userId: string, email: string): Promise<Tokens> {
		const jwtPayload: JwtPayload = {
			sub: userId,
			email: email,
		};

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(jwtPayload, {
				secret: this.config.get<string>('AT_SECRET'),
				expiresIn: '2h',
			}),
			this.jwtService.signAsync(jwtPayload, {
				secret: this.config.get<string>('RT_SECRET'),
				expiresIn: '7d',
			}),
		]);

		return {
			accessToken: accessToken,
			refreshToken: refreshToken,
		};
	}

	async validateUser(payload:LoginUserDto): Promise<any> {
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

		const user = await this.prisma.user.findUnique({
			where: query
		});

		if(!user) {
			return null;
		}

		const passwordMatches = await argon.verify(user.password, user.passwordSalt + payload.password);
		if (passwordMatches) {
			const {password, ...result} = user;
			return result;
		} else {
			return null;
		}
	}

	async sendPhoneVerificationCode(phoneNumber: string):Promise<string> {
		if (!phoneNumber) {
			throw new HttpException("no phone number entered", HttpStatus.BAD_REQUEST);
		}

		await this.prisma.phoneVerificationCode.updateMany({
			where: {
				phoneNumber: phoneNumber,
				status: 0,
			},
			data: {
				status: 2,
			},
		});

		const code:string = Math.floor(100000 + Math.random() * 900000).toString();
		await this.prisma.phoneVerificationCode.create({
			data: {
				phoneNumber: phoneNumber,
				code: code,
			},
		}).catch((error) => {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new HttpException("cannot send code", HttpStatus.FORBIDDEN);
				}
			}
			throw error;
		});

		return code;
	}

	async checkPhoneVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
		if (!phoneNumber || !code) {
			throw new HttpException("phone number and code required", HttpStatus.BAD_REQUEST);
		}

		const sentCode = await this.prisma.phoneVerificationCode.findFirst({
			where: {
				phoneNumber: phoneNumber,
				code: code,
				status: 0
			},
		});
		if (!sentCode) {
			return false;
		}

		const time = (new Date()).valueOf() - (new Date(sentCode.createdAt)).valueOf();
		if (time / 60000 > 3) {
			return false;
		}		

		await this.prisma.phoneVerificationCode.update({
			where: {
				id: sentCode.id,
			},
			data: {
				status: 1,
			},
		});
		return true;
	}

	// check if phone number has been verified within the last hour
	async checkPhoneVerifiedRecord(phoneNumber: string, code: string): Promise<number> {
		if (!phoneNumber || !code) {
			throw new HttpException("phone number and code required", HttpStatus.BAD_REQUEST);
		}

		const verifiedCode = await this.prisma.phoneVerificationCode.findFirst({
			where: {
				phoneNumber: phoneNumber,
				code: code,
				status: 1
			},
		});
		if (!verifiedCode) {
			throw new HttpException("verify phone number first", HttpStatus.FORBIDDEN);
		}

		const time = (new Date()).valueOf() - (new Date(verifiedCode.updatedAt)).valueOf();
		if (time / 60000 > 60) {
			throw new HttpException("verify phone number again", HttpStatus.FORBIDDEN);
		}

		return verifiedCode.id;
	}

	async resetPasswordWithPhoneNumber(payload: ResetPasswordDto): Promise<boolean> {
		const phoneCodeId = await this.checkPhoneVerifiedRecord(payload.phoneNumber, payload.code);
		if (!phoneCodeId) {
			throw new HttpException("verify phone number first", HttpStatus.FORBIDDEN);
		}

		const salt = (Math.random().toString(36)+'00000000000000000').slice(2, 10);
		const hash = await argon.hash(salt + payload.newPassword);

		await this.prisma.user.update({
			where: {
				phoneNumber: payload.phoneNumber,
			},
			data: {
				password: hash,
				passwordSalt: salt,
			},
		}).catch((error) => {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new HttpException("error updating user password", HttpStatus.FORBIDDEN);
				}
			}
			throw error;
		});;

		// update status of phone verification code
		await this.prisma.phoneVerificationCode.update({
			where: {
				id: phoneCodeId,
			},
			data: {
				status: 3,
			},
		});

		return true;
	}
}