import api from '../client';

export interface Notification {
    id: string;
    type: string;
    message: string;
    outletId: string;
    productId?: string;
    seen: boolean;
    createdAt: string;
}

export const notificationsApi = {
    getAll: async (outletId?: string) => {
        const response = await api.get<Notification[]>('/notifications', {
            params: { outletId }
        });
        return response.data;
    },

    markAsSeen: async (id: string) => {
        const response = await api.patch<Notification>(`/notifications/${id}/seen`);
        return response.data;
    },

    markAllAsSeen: async (outletId: string) => {
        const response = await api.patch<{ count: number }>('/notifications/seen-all', undefined, {
            params: { outletId },
        });
        return response.data;
    },

    remove: async (id: string) => {
        await api.delete(`/notifications/${id}`);
    }
};
