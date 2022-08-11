import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  exports: [],
  controllers: [ UsersController ],
  providers: [ PrismaService ]
})
export class UsersModule {}
