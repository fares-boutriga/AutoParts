import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
    @ApiProperty()
    @IsString()
    outletId: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    customerId?: string;

    @ApiProperty()
    @IsNumber()
    totalAmount: number;

    @ApiProperty({ enum: ['cash', 'card', 'credit'] })
    @IsString()
    paymentMethod: string;

    @ApiProperty({ type: [OrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
