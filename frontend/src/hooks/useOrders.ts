import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ordersApi from '@/lib/api/endpoints/orders';
import type { OrderQuery } from '@/lib/api/endpoints/orders';
import { toast } from 'react-hot-toast';

export const useOrders = (params?: OrderQuery) => {
    return useQuery({
        queryKey: ['orders', params],
        queryFn: () => ordersApi.getAll(params),
    });
};

export const useOrder = (id: string) => {
    return useQuery({
        queryKey: ['orders', id],
        queryFn: () => ordersApi.getOne(id),
        enabled: !!id,
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ordersApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            // toast.success('Order created successfully'); // Usually handled by POS UI
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to create order';
            toast.error(message);
        },
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: any }) =>
            ordersApi.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Order status updated');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update order status';
            toast.error(message);
        },
    });
};
