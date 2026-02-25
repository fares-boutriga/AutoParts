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

export interface Stock {
    id: string;
    productId: string;
    outletId: string;
    quantity: number;
    minStockLevel?: number;
    product: {
        id: string;
        name: string;
        reference: string;
        category?: {
            name: string;
        };
    };
    outlet: {
        id: string;
        name: string;
    };
    updatedAt: string;
}

export interface AdjustStockPayload {
    adjustment: number;
    reason: string;
}

const stockApi = {
    // Alerts
    getAlerts: async (params?: StockAlertQuery) => {
        const response = await api.get<{ data: StockAlert[], meta: any }>('/stock/alerts', { params });
        return response.data;
    },

    acknowledgeAlert: async (id: string) => {
        const response = await api.patch<StockAlert>(`/stock/alerts/${id}/acknowledge`);
        return response.data;
    },

    // Stock Management
    getAll: async (params?: { outletId?: string; productId?: string }) => {
        const response = await api.get<Stock[]>('/stock', { params });
        return response.data;
    },

    adjust: async (id: string, payload: AdjustStockPayload) => {
        const response = await api.post<Stock>(`/stock/${id}/adjust`, payload);
        return response.data;
    },

    update: async (id: string, data: { minStockLevel?: number }) => {
        const response = await api.patch<Stock>(`/stock/${id}`, data);
        return response.data;
    }
};

export default stockApi;
