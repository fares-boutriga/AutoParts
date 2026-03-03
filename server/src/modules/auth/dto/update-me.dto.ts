import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, MinLength } from 'class-validator';

export class UpdateMeDto {
    @ApiPropertyOptional({ example: 'Ahmed Ben Ali' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: '+216 98 000 000' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'nouveau@email.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: 'NouveauMotDePasse123' })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;
}
