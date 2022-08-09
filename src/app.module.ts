import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { AppController } from './app.controller';
import { UsersController } from './users/users.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    UsersController,
  ],
  providers: [PrismaService],
})
export class AppModule {}