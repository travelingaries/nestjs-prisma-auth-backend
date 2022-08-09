import { IsNotEmpty } from 'class-validator';

import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @IsNotEmpty()
    @ApiProperty() email: string;
  
    @IsNotEmpty()
    @ApiProperty() nickname: string;

    @IsNotEmpty()
    @ApiProperty() password: string;

    @IsNotEmpty()
    @ApiProperty() name: string;

    @IsNotEmpty()
    @ApiProperty() phoneNumber: string;
}

export class LoginUserDto {
    @IsNotEmpty()
    @ApiProperty() readonly loginType: string;

    @IsNotEmpty()
    @ApiProperty() readonly loginValue: string;

    @IsNotEmpty()
    @ApiProperty() readonly password: string;
}

export class UpdatePasswordDto {
    @IsNotEmpty()
    @ApiProperty() currentPassword: string;

    @IsNotEmpty()
    @ApiProperty() newPassword: string;
}