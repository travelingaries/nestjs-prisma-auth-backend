import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from "@nestjs/swagger";

export class VerifyCodeDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty() phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty() code: string;
}

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty() phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty() code: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty() newPassword: string;
}