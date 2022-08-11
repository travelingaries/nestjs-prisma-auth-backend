import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { AccessTokenStrategy } from '../auth/strategies';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, AccessTokenStrategy],
  exports: [UsersService]
})
export class UsersModule {}
