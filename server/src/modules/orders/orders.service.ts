import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockAlertsService } from '../stock-alerts/stock-alerts.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private stockAlertsService: StockAlertsService,
    ) { }

    async create(createOrderDto: CreateOrderDto, cashierId: string) {
        const { items, ...orderData } = createOrderDto;

        // 1. Verify all stock is available (pre-transaction validation)
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

        // 2. Transaction: Create Order -> Create Items -> Deduct Stock -> Create Alerts
        return this.prisma.$transaction(async (tx) => {
            // Create Order
            const order = await tx.order.create({
                data: {
                    outletId: orderData.outletId,
                    cashierId: cashierId,
                    customerId: orderData.customerId,
                    paymentMethod: orderData.paymentMethod,
                    totalAmount: createOrderDto.totalAmount,
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

            // Deduct stock and check for low stock alerts
            for (const item of items) {
                const stock = await tx.stock.findUnique({
                    where: {
                        productId_outletId: {
                            productId: item.productId,
                            outletId: orderData.outletId,
                        },
                    },
                    include: {
                        product: true,
                        outlet: true,
                    },
                });

                if (stock) {
                    // Deduct stock quantity
                    const updatedStock = await tx.stock.update({
                        where: { id: stock.id },
                        data: { quantity: { decrement: item.quantity } },
                    });

                    // Check if stock is now below minimum level
                    const effectiveMinLevel = updatedStock.minStockLevel ?? stock.product.minStockLevel;
                    const newQuantity = updatedStock.quantity;

                    if (newQuantity < effectiveMinLevel && stock.outlet.alertsEnabled) {
                        // Check cooldown to avoid duplicate alerts
                        const cooldownHours = 24; // Could be configurable
                        const cooldownDate = new Date();
                        cooldownDate.setHours(cooldownDate.getHours() - cooldownHours);

                        const shouldAlert = !stock.lastAlertAt || stock.lastAlertAt < cooldownDate;

                        if (shouldAlert) {
                            // Create alert notification within transaction
                            // Email will be sent asynchronously (fire and forget)
                            await this.stockAlertsService.createStockAlert(
                                stock.id,
                                stock.product.name,
                                newQuantity,
                                effectiveMinLevel,
                                stock.outlet.name,
                                stock.outletId,
                                stock.productId,
                                stock.outlet.email,
                                stock.outlet.alertsEnabled,
                            );
                        }
                    }
                }
            }

            return order;
        });
    }

    async findAll(filters?: {
        outletId?: string;
        cashierId?: string;
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const page = Number(filters?.page) || 1;
        const limit = Number(filters?.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filters?.outletId) where.outletId = filters.outletId;
        if (filters?.cashierId) where.cashierId = filters.cashierId;

        if (filters?.search) {
            where.OR = [
                { id: { contains: filters.search, mode: 'insensitive' } },
                { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    outlet: true,
                    cashier: { select: { id: true, name: true } },
                    customer: true,
                    _count: { select: { items: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
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
