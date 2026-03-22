import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockAlertsService } from '../stock-alerts/stock-alerts.service';
import { CreateOrderDto } from './dto/create-order.dto';

type PendingStockAlert = {
    stockId: string;
    productName: string;
    currentQuantity: number;
    minStockLevel: number;
    outletName: string;
    outletId: string;
    productId: string;
    outletEmail: string | null;
    alertsEnabled: boolean;
    outletTelegramChatId: string | null;
    telegramAlertsEnabled: boolean;
};

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private stockAlertsService: StockAlertsService,
    ) { }

    async create(createOrderDto: CreateOrderDto, cashierId: string) {
        const { items, customerId, paymentMethod, totalAmount } = createOrderDto;
        const outletId = await this.resolveOutletId(cashierId, createOrderDto.outletId);

        // 1. Verify all stock is available (pre-transaction validation)
        for (const item of items) {
            const stock = await this.prisma.stock.findUnique({
                where: {
                    productId_outletId: {
                        productId: item.productId,
                        outletId,
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
        const transactionResult = await this.prisma.$transaction(async (tx) => {
            const pendingStockAlerts: PendingStockAlert[] = [];

            // Create Order
            const order = await tx.order.create({
                data: {
                    outletId,
                    cashierId: cashierId,
                    customerId,
                    paymentMethod,
                    totalAmount,
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
                            outletId,
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
                            pendingStockAlerts.push({
                                stockId: stock.id,
                                productName: stock.product.name,
                                currentQuantity: newQuantity,
                                minStockLevel: effectiveMinLevel,
                                outletName: stock.outlet.name,
                                outletId: stock.outletId,
                                productId: stock.productId,
                                outletEmail: stock.outlet.email,
                                alertsEnabled: stock.outlet.alertsEnabled,
                                outletTelegramChatId: (stock.outlet as any).telegramChatId ?? null,
                                telegramAlertsEnabled: Boolean((stock.outlet as any).telegramAlertsEnabled),
                            });
                        }
                    }
                }
            }

            return { order, pendingStockAlerts };
        }, {
            maxWait: 10000,
            timeout: 15000,
        });

        for (const alert of transactionResult.pendingStockAlerts) {
            this.stockAlertsService
                .createStockAlert(
                    alert.stockId,
                    alert.productName,
                    alert.currentQuantity,
                    alert.minStockLevel,
                    alert.outletName,
                    alert.outletId,
                    alert.productId,
                    alert.outletEmail,
                    alert.alertsEnabled,
                    alert.outletTelegramChatId,
                    alert.telegramAlertsEnabled,
                )
                .catch((error) => {
                    console.error('[OrdersService] Failed to create stock alert post-commit:', error);
                });
        }

        return transactionResult.order;
    }

    private async resolveOutletId(cashierId: string, requestedOutletId?: string): Promise<string> {
        const user = await this.prisma.user.findUnique({
            where: { id: cashierId },
            select: {
                roles: {
                    select: {
                        role: {
                            select: { name: true },
                        },
                    },
                },
                outlets: {
                    select: { outletId: true },
                },
            },
        });

        if (!user) {
            throw new BadRequestException('Cashier not found');
        }

        const assignedOutletIds = new Set(user.outlets.map((outlet) => outlet.outletId));
        const isAdmin = user.roles.some((userRole) =>
            (userRole.role?.name ?? '').toLowerCase().includes('admin'),
        );

        if (requestedOutletId) {
            if (!isAdmin && !assignedOutletIds.has(requestedOutletId)) {
                throw new ForbiddenException('You are not allowed to create orders for this outlet');
            }

            const outlet = await this.prisma.outlet.findUnique({
                where: { id: requestedOutletId },
                select: { id: true },
            });

            if (!outlet) {
                throw new BadRequestException('Requested outlet does not exist');
            }

            return outlet.id;
        }

        const firstAssignedOutlet = user.outlets[0]?.outletId;
        if (firstAssignedOutlet) {
            return firstAssignedOutlet;
        }

        if (isAdmin) {
            const defaultOutlet = await this.prisma.outlet.findFirst({
                select: { id: true },
                orderBy: { createdAt: 'asc' },
            });
            if (defaultOutlet?.id) {
                return defaultOutlet.id;
            }

            throw new BadRequestException('No outlet is configured in the system');
        }

        throw new ForbiddenException('No outlet is assigned to the current user');
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
