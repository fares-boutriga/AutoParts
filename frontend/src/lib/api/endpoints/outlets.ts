import api from '../client';

export interface Outlet {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    alertsEnabled: boolean;
    telegramAlertsEnabled?: boolean;
    telegramChatId?: string;
    telegramChatType?: string | null;
    telegramChatTitle?: string | null;
    telegramConnectedAt?: string | null;
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
    alertEmail?: string;
    telegramAlertsEnabled?: boolean;
    telegramChatId?: string;
}

export interface InitTelegramConnectPayload {
    targetType: 'group' | 'private';
}

export interface InitTelegramConnectResponse {
    connectUrl: string;
    targetType: 'group' | 'private';
    expiresAt: string;
}

export interface TelegramConnectStatusResponse {
    connected: boolean;
    chatId: string | null;
    chatType: string | null;
    chatTitle: string | null;
    connectedAt: string | null;
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

    initTelegramConnect: async (id: string, payload: InitTelegramConnectPayload) => {
        const response = await api.post<InitTelegramConnectResponse>(`/outlets/${id}/telegram/connect/init`, payload);
        return response.data;
    },

    getTelegramConnectStatus: async (id: string) => {
        const response = await api.get<TelegramConnectStatusResponse>(`/outlets/${id}/telegram/connect/status`);
        return response.data;
    },

    disconnectTelegram: async (id: string) => {
        const response = await api.delete<{ success: true }>(`/outlets/${id}/telegram/connect`);
        return response.data;
    },

    remove: async (id: string) => {
        await api.delete(`/outlets/${id}`);
    },
};
