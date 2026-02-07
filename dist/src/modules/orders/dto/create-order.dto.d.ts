import { OrderItemDto } from './order-item.dto';
export declare class CreateOrderDto {
    outletId: string;
    customerId?: string;
    totalAmount: number;
    paymentMethod: string;
    items: OrderItemDto[];
}
