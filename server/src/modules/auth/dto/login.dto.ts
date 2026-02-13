import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'admin@autoparts.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'admin123' })
    @IsString()
    password: string;
}
