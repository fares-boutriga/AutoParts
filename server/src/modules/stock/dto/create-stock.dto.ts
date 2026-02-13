import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateStockDto {
    @ApiProperty()
    @IsString()
    productId: string;

    @ApiProperty()
    @IsString()
    outletId: string;

    @ApiProperty({ default: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    quantity?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minStockLevel?: number;
}
