import api from '../client';

export interface Outlet {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    alertsEnabled: boolean;
    _count?: {
        users: number;
        stocks: number;
        orders: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateOutletPayload {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface UpdateOutletPayload extends Partial<CreateOutletPayload> { }

export interface UpdateOutletAlertsPayload {
    alertsEnabled: boolean;
    email?: string;
}

export const outletsApi = {
    getAll: async () => {
        const response = await api.get<Outlet[]>('/outlets');
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<Outlet>(`/outlets/${id}`);
        return response.data;
    },

    create: async (payload: CreateOutletPayload) => {
        const response = await api.post<Outlet>('/outlets', payload);
        return response.data;
    },

    update: async (id: string, payload: UpdateOutletPayload) => {
        const response = await api.patch<Outlet>(`/outlets/${id}`, payload);
        return response.data;
    },

    updateAlerts: async (id: string, payload: UpdateOutletAlertsPayload) => {
        const response = await api.patch<Outlet>(`/outlets/${id}/alerts`, payload);
        return response.data;
    },

    remove: async (id: string) => {
        await api.delete(`/outlets/${id}`);
    },
};
