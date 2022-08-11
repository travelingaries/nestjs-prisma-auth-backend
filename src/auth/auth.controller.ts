import {
	Body,
	Controller,
	HttpException,
	HttpStatus,
	Get,
	Post,
	Put,
	UseGuards,
	Req,
} from '@nestjs/common';
import { Request } from 'express';

import { Public, GetCurrentUser } from '../common/decorators';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload, Tokens } from './types';

import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';

interface RequestUser extends Request {
	user: any
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
   	 * user sign up
     */
	@Post('register')
	public async register(@Body() payload: CreateUserDto): Promise<Tokens> {
		return await this.authService.register(payload);
	}

	/**
   	 * user log in
     */
	@Post('login')
	public async login(@Body() payload: LoginUserDto): Promise<Tokens> {
		return await this.authService.login(payload);
	}

	/**
   	 * user log out
     */
    @UseGuards(AuthGuard('jwt'))
	@Post('logout')
	public async logout(@Req() req: Request): Promise<boolean> {
		return await this.authService.logout((<RequestUser>req).user.id);
	}

	/**
   	 * refresh user tokens
     */
	@Public()
	@UseGuards(AuthGuard('jwt-refresh'))
	@Post('refresh')
	refreshTokens(@Req() req: Request): Promise<Tokens> {
		const user = (<RequestUser>req).user;
		return this.authService.refreshTokens(user.sub, user.refreshToken);
	}
}