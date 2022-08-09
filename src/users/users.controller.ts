import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PrismaService } from '../prisma.service';

@ApiTags('사용자')
@Controller('users')
export class UsersController {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 사용자 리스트 조회
   */
  @Get('')
  async getUsers() {
    return this.prismaService.user.findMany();
  }
}