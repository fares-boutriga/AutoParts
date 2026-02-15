import api from '../client';

export interface StockAlert {
    id: string;
    productId: string;
    productName: string;
    reference: string;
    currentStock: number;
    minStockLevel: number;
    status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED';
    createdAt: string;
}

export interface StockAlertQuery {
    status?: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED';
    page?: number;
    limit?: number;
}

const stockAlertsApi = {
    getAll: async (params?: StockAlertQuery) => {
        const response = await api.get<{ data: StockAlert[], meta: any }>('/stock/alerts', { params });
        return response.data;
    },

    acknowledge: async (id: string) => {
        const response = await api.patch<StockAlert>(`/stock/alerts/${id}/acknowledge`);
        return response.data;
    },
};

export default stockAlertsApi;
