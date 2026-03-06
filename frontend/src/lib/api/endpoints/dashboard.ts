import api from '../client';

export type DashboardPeriod = 'today' | '7d' | 'month';

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

export interface DashboardSummary {
    kpis: DashboardKpis;
    recentSales: DashboardSaleRow[];
    meta: {
        period: DashboardPeriod;
        outletId: string;
        generatedAt: string;
    };
}

export interface DashboardSummaryQuery {
    period?: DashboardPeriod;
    outletId?: string;
}

const dashboardApi = {
    getSummary: async (params?: DashboardSummaryQuery): Promise<DashboardSummary> => {
        const response = await api.get<DashboardSummary>('/dashboard/summary', { params });
        return response.data;
    },
};

export default dashboardApi;
