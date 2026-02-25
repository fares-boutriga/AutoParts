import api from '../client';

export interface Customer {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    orderCount: number;
    lastOrderAt?: string;
    createdAt: string;
    orders?: any[];
}

export interface CustomerFilters {
    search?: string;
    page?: number;
    limit?: number;
}

export interface CreateCustomerPayload {
    name: string;
    phone?: string;
    email?: string;
}

export interface UpdateCustomerPayload {
    name?: string;
    phone?: string;
    email?: string;
}

export const customersApi = {
    getAll: async (params?: CustomerFilters) => {
        const response = await api.get<{ data: Customer[]; meta: any }>('/customers', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<Customer>(`/customers/${id}`);
        return response.data;
    },

    create: async (payload: CreateCustomerPayload) => {
        const response = await api.post<Customer>('/customers', payload);
        return response.data;
    },

    update: async (id: string, payload: UpdateCustomerPayload) => {
        const response = await api.patch<Customer>(`/customers/${id}`, payload);
        return response.data;
    },

    remove: async (id: string) => {
        await api.delete(`/customers/${id}`);
    },
};
