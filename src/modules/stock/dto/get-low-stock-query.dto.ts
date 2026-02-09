import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class GetLowStockQueryDto {
    @ApiProperty({
        description: 'Outlet ID to check low stock for',
        example: 'uuid-here',
    })
    @IsString()
    outletId: string;

    @ApiProperty({
        description: 'Optional threshold override for low stock level',
        example: 5,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    threshold?: number;
}
