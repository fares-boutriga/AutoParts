import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateStockDto {
    @ApiProperty({ required: false })
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
