import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

import { AppController } from './app.controller';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';

import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './common/guards';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, PrismaModule, UsersModule],
  controllers: [
    AppController,
    UsersController,
  ],
  
})
export class AppModule {}