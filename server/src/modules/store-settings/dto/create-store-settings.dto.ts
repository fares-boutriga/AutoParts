import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStoreSettingsDto {
    @ApiPropertyOptional({ example: 'Auto Pièces Tunis' })
    @IsOptional()
    @IsString()
    storeName?: string;

    @ApiPropertyOptional({ example: 'Rue de la Liberté, Tunis 1001' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ example: '+216 71 000 000' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'contact@autopieces.tn' })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional({ example: 19, description: 'TVA en pourcentage (ex: 19 pour 19%)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    tva?: number;

    @ApiPropertyOptional({ example: 'A123456789' })
    @IsOptional()
    @IsString()
    patente?: string;

    @ApiPropertyOptional({ example: 'FA-' })
    @IsOptional()
    @IsString()
    invoicePrefix?: string;

    @ApiPropertyOptional({ example: 'TND' })
    @IsOptional()
    @IsString()
    currency?: string;
}
