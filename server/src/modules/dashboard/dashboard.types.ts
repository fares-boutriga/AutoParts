import type { DashboardPeriod } from './dto/dashboard-query.dto';

export interface DashboardKpis {
    todayRevenue: number;
    todayOrdersCount: number;
    inStockProductsCount: number;
    lowStockItemsCount: number;
}

export interface DashboardSaleRow {
    id: string;
    createdAt: string;
    customerName: string | null;
    cashierName: string | null;
    totalAmount: number;
    itemsCount: number;
    paymentMethod: string;
}

export interface DashboardSummaryResponse {
    kpis: DashboardKpis;
    recentSales: DashboardSaleRow[];
    meta: {
        period: DashboardPeriod;
        outletId: string;
        generatedAt: string;
    };
}
