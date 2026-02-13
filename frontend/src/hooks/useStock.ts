import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import stockAlertsApi from '@/lib/api/endpoints/stock';
import type { StockAlertQuery } from '@/lib/api/endpoints/stock';
import { toast } from 'react-hot-toast';

export const useStockAlerts = (params?: StockAlertQuery) => {
    return useQuery({
        queryKey: ['stock-alerts', params],
        queryFn: () => stockAlertsApi.getAll(params),
    });
};

export const useAcknowledgeAlert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: stockAlertsApi.acknowledge,
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
