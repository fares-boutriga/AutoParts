import api from '../client';

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId?: string;
    customerName?: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    totalAmount: number;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderDto {
    customerId?: string;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
    }[];
    status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface OrderQuery {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}

const ordersApi = {
    getAll: async (params?: OrderQuery) => {
        const response = await api.get<{ data: Order[], meta: any }>('/orders', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<Order>(`/orders/${id}`);
        return response.data;
    },

    create: async (data: CreateOrderDto) => {
        const response = await api.post<Order>('/orders', data);
        return response.data;
    },

    updateStatus: async (id: string, status: Order['status']) => {
        const response = await api.patch<Order>(`/orders/${id}/status`, { status });
        return response.data;
    },
};

export default ordersApi;
