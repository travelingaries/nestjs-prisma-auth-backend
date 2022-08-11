import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

import { ApiTags } from '@nestjs/swagger';

interface RequestUser extends Request {
  user: any
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * show all users (email and nickname only)
   */
  @Get('')
  async getUsers() {
    return await this.usersService.getAllUsers();
  }

  /**
   * show current user info
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('/profile')
  async getCurrentUser(@Req() req: Request) {
    const user = await this.usersService.getUserById((<RequestUser>req).user.sub, (<RequestUser>req).user.sub);

    return user;
  }

  /**
   * show user info (summary if not logged in)
   */
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUserById(@Param('id') id: string, @Req() req: Request) {
    const user = await this.usersService.getUserById(id, (<RequestUser>req).user.sub);

    return user;
  }
}