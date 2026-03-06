import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardQueryDto, type DashboardPeriod } from './dto/dashboard-query.dto';
import type { DashboardSummaryResponse } from './dashboard.types';

type AuthenticatedUser = {
    id: string;
    outlets?: Array<{
        outletId?: string;
        outlet?: {
            id: string;
        };
    }>;
};

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async getSummary(
        user: AuthenticatedUser,
        query: DashboardQueryDto,
    ): Promise<DashboardSummaryResponse> {
        const period: DashboardPeriod = query.period ?? 'today';
        const allowedOutletIds = this.getAllowedOutletIds(user);

        if (allowedOutletIds.length === 0) {
            throw new ForbiddenException('User has no assigned outlets');
        }

        const outletId = query.outletId ?? allowedOutletIds[0];

        if (!allowedOutletIds.includes(outletId)) {
            throw new ForbiddenException('Access denied for this outlet');
        }

        const { from, to } = this.getPeriodRange(period);

        const orderWhere = {
            outletId,
            createdAt: {
                gte: from,
                lte: to,
            },
            NOT: {
                status: {
                    equals: 'cancelled',
                    mode: 'insensitive' as const,
                },
            },
        };

        const [orderAggregate, todayOrdersCount, recentOrders, stockRows, inStockProductsCount] =
            await Promise.all([
                this.prisma.order.aggregate({
                    where: orderWhere,
                    _sum: { totalAmount: true },
                }),
                this.prisma.order.count({
                    where: orderWhere,
                }),
                this.prisma.order.findMany({
                    where: orderWhere,
                    include: {
                        customer: { select: { name: true } },
                        cashier: { select: { name: true } },
                        _count: { select: { items: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
                this.prisma.stock.findMany({
                    where: { outletId },
                    select: {
                        quantity: true,
                        minStockLevel: true,
                        product: {
                            select: {
                                minStockLevel: true,
                            },
                        },
                    },
                }),
                this.prisma.stock.count({
                    where: {
                        outletId,
                        quantity: { gt: 0 },
                    },
                }),
            ]);

        const lowStockItemsCount = stockRows.reduce((count, stockRow) => {
            const effectiveMinStockLevel =
                stockRow.minStockLevel ?? stockRow.product.minStockLevel;
            return stockRow.quantity < effectiveMinStockLevel ? count + 1 : count;
        }, 0);

        return {
            kpis: {
                todayRevenue: Number(orderAggregate._sum.totalAmount ?? 0),
                todayOrdersCount,
                inStockProductsCount,
                lowStockItemsCount,
            },
            recentSales: recentOrders.map((order) => ({
                id: order.id,
                createdAt: order.createdAt.toISOString(),
                customerName: order.customer?.name ?? null,
                cashierName: order.cashier?.name ?? null,
                totalAmount: Number(order.totalAmount),
                itemsCount: order._count.items,
                paymentMethod: order.paymentMethod,
            })),
            meta: {
                period,
                outletId,
                generatedAt: new Date().toISOString(),
            },
        };
    }

    private getAllowedOutletIds(user: AuthenticatedUser): string[] {
        return (user.outlets ?? [])
            .map((userOutlet) => userOutlet.outletId ?? userOutlet.outlet?.id)
            .filter((value): value is string => Boolean(value));
    }

    private getPeriodRange(period: DashboardPeriod): { from: Date; to: Date } {
        const now = new Date();
        const from = new Date(now);

        switch (period) {
            case '7d':
                from.setHours(0, 0, 0, 0);
                from.setDate(from.getDate() - 6);
                break;
            case 'month':
                from.setDate(1);
                from.setHours(0, 0, 0, 0);
                break;
            case 'today':
            default:
                from.setHours(0, 0, 0, 0);
                break;
        }

        return { from, to: now };
    }
}
