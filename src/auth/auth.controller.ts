import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	HttpException,
	HttpStatus,
	Get,
	Post,
	Put,
	Param,
	ParseIntPipe,
	Query,
	Request,
	UseGuards,
	UseInterceptors
} from '@nestjs/common';

import { AuthService, RegistrationStatus } from './auth.service';

import { CreateUserDto, LoginUserDto } from '../users/user.dto';

import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	public async register(@Body() payload: CreateUserDto):Promise<RegistrationStatus> {
		const result:RegistrationStatus = await this.authService.register(payload);
		if (!result.success) {
			throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
		}
		return result;
	}

	@Post('login')
	public async login(@Body() payload: LoginUserDto):Promise<any> {
		return await this.authService.login(payload);
	}
}