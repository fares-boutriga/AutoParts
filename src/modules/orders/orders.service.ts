import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockService } from '../stock/stock.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private stockService: StockService,
    ) { }

    async create(createOrderDto: CreateOrderDto, cashierId: string) {
        const { items, ...orderData } = createOrderDto;

        // 1. Verify all stock is available
        for (const item of items) {
            const stock = await this.prisma.stock.findUnique({
                where: {
                    productId_outletId: {
                        productId: item.productId,
                        outletId: orderData.outletId,
                    },
                },
                include: { product: true },
            });

            if (!stock) {
                throw new BadRequestException(
                    `Product ${item.productId} not found at this outlet`,
                );
            }

            if (stock.quantity < item.quantity) {
                throw new BadRequestException(
                    `Insufficient stock for product ${stock.product.name}. Available: ${stock.quantity}, Requested: ${item.quantity}`,
                );
            }
        }

        // 2. Transaction: Create Order -> Create Items -> Deduct Stock
        // Note: StockService.adjust() is not transactional by default, so we'll do manual updates in transaction
        // Or simpler: Create order in transaction, then adjust stock sequentially (since we already checked availability)

        // Better approach: Do it all in one prisma.$transaction

        return this.prisma.$transaction(async (tx) => {
            // Create Order
            const order = await tx.order.create({
                data: {
                    outletId: orderData.outletId,
                    cashierId: cashierId,
                    customerId: orderData.customerId,
                    paymentMethod: orderData.paymentMethod,
                    totalAmount: createOrderDto.totalAmount, // Assuming backend trusts frontend calc, or re-calc here
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            subtotal: item.subtotal,
                        })),
                    },
                },
                include: {
                    items: { include: { product: true } },
                    outlet: true,
                    cashier: { select: { id: true, name: true } },
                    customer: true,
                },
            });

            // Deduct stock for each item
            for (const item of items) {
                // Find the stock record ID first
                const stock = await tx.stock.findUnique({
                    where: {
                        productId_outletId: {
                            productId: item.productId,
                            outletId: orderData.outletId,
                        },
                    },
                });

                if (stock) {
                    // We update using the service method if possible to trigger alerts?
                    // Accessing service from within transaction is tricky because service uses this.prisma (not tx).
                    // Strategy: Update DB in tx, then trigger alerts AFTER tx commits.

                    await tx.stock.update({
                        where: { id: stock.id },
                        data: { quantity: { decrement: item.quantity } },
                    });
                }
            }

            return order;
        }).then(async (order) => {
            // Post-transaction: Trigger alerts
            // We need to find the stock IDs again or pass them through
            for (const item of order.items) {
                const stock = await this.prisma.stock.findUnique({
                    where: { productId_outletId: { productId: item.productId, outletId: order.outletId } }
                });
                if (stock) {
                    await this.stockService.adjust(stock.id, { adjustment: 0, reason: 'Alert Check' });
                    // adjust(0) just to trigger the check logic in service, or call checkStockAfterUpdate directly if public
                    // Actually stockService.adjust calls checkStockAfterUpdate.
                    // But passing 0 might look like a no-op in logs? 
                    // Better is to allow StockService to expose check method, or just use adjust(0).
                    // Let's use the method we know works: updating via service triggers checks.
                    // Since we already updated DB, we just need to trigger the check.
                    // I can't access StockAlertService directly here easily without injecting it.
                    // But StockService has it. 
                    // Let's verify StockService implementation.
                }
            }
            return order;
        });
    }

    async findAll(filters?: { outletId?: string; cashierId?: string }) {
        const where: any = {};
        if (filters?.outletId) where.outletId = filters.outletId;
        if (filters?.cashierId) where.cashierId = filters.cashierId;

        return this.prisma.order.findMany({
            where,
            include: {
                outlet: true,
                cashier: { select: { id: true, name: true } },
                customer: true,
                _count: { select: { items: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                outlet: true,
                cashier: { select: { id: true, name: true } },
                customer: true,
            },
        });

        if (!order) throw new NotFoundException('Order not found');
        return order;
    }
}
