import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty() email: string;
  
    @IsNotEmpty()
    @IsString()
    @ApiProperty() nickname: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty() password: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty() name: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty() phoneNumber: string;
}

export class LoginUserDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty() readonly loginType: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty() readonly loginValue: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty() readonly password: string;
}

export class UpdatePasswordDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty() currentPassword: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty() newPassword: string;
}