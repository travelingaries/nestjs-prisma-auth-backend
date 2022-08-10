import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: process.env.AT_SECRET_KEY,
      signOptions: {
        expiresIn: process.env.EXPIRES_IN
      }
    })
  ],
  controllers: [ AuthController ],
  providers: [ AuthService, UsersService, JwtStrategy, PrismaService ],
  exports: [
    PassportModule,
    JwtModule
  ],
})
export class AuthModule {}
