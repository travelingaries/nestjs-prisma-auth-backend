import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PrismaService } from '../prisma/prisma.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * show all users
   */
  @Get('')
  async getUsers() {
    return this.prismaService.user.findMany();
  }
}