import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import stockApi from '@/lib/api/endpoints/stock';
import type { StockAlertQuery, AdjustStockPayload } from '@/lib/api/endpoints/stock';
import { toast } from 'react-hot-toast';

// Alerts
export const useStockAlerts = (params?: StockAlertQuery) => {
    return useQuery({
        queryKey: ['stock-alerts', params],
        queryFn: () => stockApi.getAlerts(params),
    });
};

export const useAcknowledgeAlert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: stockApi.acknowledgeAlert,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock-alerts'] });
            toast.success('Alert acknowledged');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to acknowledge alert';
            toast.error(message);
        },
    });
};

// Stock Management
export const useStock = (params?: { outletId?: string; productId?: string }) => {
    return useQuery({
        queryKey: ['stock', params],
        queryFn: () => stockApi.getAll(params),
    });
};

export const useAdjustStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string, payload: AdjustStockPayload }) =>
            stockApi.adjust(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Products might show total quantity
            toast.success('Stock adjusted');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to adjust stock';
            toast.error(message);
        },
    });
};

export const useUpdateStockSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: { minStockLevel?: number } }) =>
            stockApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            toast.success('Stock settings updated');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update stock';
            toast.error(message);
        },
    });
};
