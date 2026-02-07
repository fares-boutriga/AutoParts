import { PrismaService } from '../../prisma/prisma.service';
import { StockService } from '../stock/stock.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private prisma;
    private stockService;
    constructor(prisma: PrismaService, stockService: StockService);
    create(createOrderDto: CreateOrderDto, cashierId: string): Promise<{
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string | null;
            address: string | null;
            alertsEnabled: boolean;
        };
        customer: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string | null;
        } | null;
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                reference: string | null;
                categoryId: string | null;
                supplier: string | null;
                purchasePrice: import("@prisma/client/runtime/library").Decimal;
                sellingPrice: import("@prisma/client/runtime/library").Decimal;
                minStockLevel: number;
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
        cashier: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        customerId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        status: string;
        cashierId: string;
    }>;
    findAll(filters?: {
        outletId?: string;
        cashierId?: string;
    }): Promise<({
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string | null;
            address: string | null;
            alertsEnabled: boolean;
        };
        _count: {
            items: number;
        };
        customer: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string | null;
        } | null;
        cashier: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        customerId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        status: string;
        cashierId: string;
    })[]>;
    findOne(id: string): Promise<{
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string | null;
            address: string | null;
            alertsEnabled: boolean;
        };
        customer: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string | null;
        } | null;
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                reference: string | null;
                categoryId: string | null;
                supplier: string | null;
                purchasePrice: import("@prisma/client/runtime/library").Decimal;
                sellingPrice: import("@prisma/client/runtime/library").Decimal;
                minStockLevel: number;
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
        cashier: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        customerId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        status: string;
        cashierId: string;
    }>;
}
