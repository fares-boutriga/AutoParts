import { ForbiddenException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
    let service: DashboardService;
    let prisma: any;

    beforeEach(() => {
        prisma = {
            order: {
                aggregate: jest.fn(),
                count: jest.fn(),
                findMany: jest.fn(),
            },
            stock: {
                findMany: jest.fn(),
                count: jest.fn(),
            },
        };

        service = new DashboardService(prisma);
    });

    it('computes KPI summary and recent sales from aggregated data', async () => {
        prisma.order.aggregate.mockResolvedValue({
            _sum: { totalAmount: 613.0 },
        });
        prisma.order.count.mockResolvedValue(3);
        prisma.order.findMany.mockResolvedValue([
            {
                id: 'order-1',
                createdAt: new Date('2026-03-06T10:00:00.000Z'),
                customer: { name: 'Walk-in' },
                cashier: { name: 'Ayoub' },
                totalAmount: 613,
                paymentMethod: 'cash',
                _count: { items: 3 },
            },
        ]);
        prisma.stock.findMany.mockResolvedValue([
            { quantity: 15, minStockLevel: null, product: { minStockLevel: 10 } },
            { quantity: 4, minStockLevel: 5, product: { minStockLevel: 10 } },
            { quantity: 1, minStockLevel: null, product: { minStockLevel: 3 } },
        ]);
        prisma.stock.count.mockResolvedValue(3);

        const result = await service.getSummary(
            {
                id: 'user-1',
                outlets: [{ outletId: 'outlet-1' }],
            },
            { period: 'today', outletId: 'outlet-1' },
        );

        expect(result.kpis.todayRevenue).toBe(613);
        expect(result.kpis.todayOrdersCount).toBe(3);
        expect(result.kpis.inStockProductsCount).toBe(3);
        expect(result.kpis.lowStockItemsCount).toBe(2);
        expect(result.recentSales).toHaveLength(1);
        expect(result.recentSales[0]).toMatchObject({
            id: 'order-1',
            customerName: 'Walk-in',
            cashierName: 'Ayoub',
            totalAmount: 613,
            itemsCount: 3,
            paymentMethod: 'cash',
        });
    });

    it('defaults to first assigned outlet when outletId is not provided', async () => {
        prisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 } });
        prisma.order.count.mockResolvedValue(0);
        prisma.order.findMany.mockResolvedValue([]);
        prisma.stock.findMany.mockResolvedValue([]);
        prisma.stock.count.mockResolvedValue(0);

        await service.getSummary(
            {
                id: 'user-1',
                outlets: [{ outletId: 'outlet-primary' }, { outletId: 'outlet-second' }],
            },
            { period: 'today' },
        );

        expect(prisma.order.aggregate).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    outletId: 'outlet-primary',
                }),
            }),
        );
    });

    it('throws when the requested outlet is not assigned to the user', async () => {
        await expect(
            service.getSummary(
                {
                    id: 'user-1',
                    outlets: [{ outletId: 'outlet-1' }],
                },
                { period: 'today', outletId: 'outlet-2' },
            ),
        ).rejects.toThrow(ForbiddenException);
    });
});
