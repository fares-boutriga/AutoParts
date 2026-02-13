import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class AdjustStockDto {
    @ApiProperty({ description: 'Positive to increase, negative to decrease' })
    @IsNumber()
    adjustment: number;

    @ApiProperty()
    @IsString()
    reason: string;
}
