import {
	Body,
	Controller,
	HttpException,
	HttpStatus,
	Get,
	Post,
	Put,
	UseGuards,
} from '@nestjs/common';

import { Public, GetCurrentUserId, GetCurrentUser } from '../common/decorators';
import { RefreshTokenGuard } from '../common/guards';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { Tokens } from './types';

import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';

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
	@Post('logout')
	public async logout(@GetCurrentUserId() userId: string): Promise<boolean> {
		return await this.authService.logout(userId);
	}

	/**
   	 * refresh user tokens
     */
	@Public()
	@UseGuards(RefreshTokenGuard)
	@Post('refresh')
	refreshTokens(
		@GetCurrentUserId() userId: string,
		@GetCurrentUser('refreshToken') refreshToken: string,
	): Promise<Tokens> {
		return this.authService.refreshTokens(userId, refreshToken);
	}
}