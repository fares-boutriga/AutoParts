import apiClient from '../client';

export interface StoreSettings {
    id: string;
    storeName: string;
    address?: string;
    phone?: string;
    email?: string;
    tva: number;
    patente?: string;
    invoicePrefix: string;
    nextInvoiceNumber: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateStoreSettingsDto {
    storeName?: string;
    address?: string;
    phone?: string;
    email?: string;
    tva?: number;
    patente?: string;
    invoicePrefix?: string;
    currency?: string;
}

const storeSettingsApi = {
    get: async (): Promise<StoreSettings> => {
        const { data } = await apiClient.get('/store-settings');
        return data;
    },

    update: async (payload: UpdateStoreSettingsDto): Promise<StoreSettings> => {
        const { data } = await apiClient.patch('/store-settings', payload);
        return data;
    },
};

export default storeSettingsApi;
