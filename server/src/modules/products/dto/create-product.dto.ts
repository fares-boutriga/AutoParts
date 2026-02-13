import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateProductDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    reference?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    supplier?: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    purchasePrice: number;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    sellingPrice: number;

    @ApiProperty({ default: 10 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minStockLevel?: number;

    @ApiProperty({ default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
