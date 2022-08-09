import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { AppController } from './app.controller';
import { UsersController } from './users/users.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [
    AppController,
    UsersController,
  ],
  providers: [PrismaService],
})
export class AppModule {}